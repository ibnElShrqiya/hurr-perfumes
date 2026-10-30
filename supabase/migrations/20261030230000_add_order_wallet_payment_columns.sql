-- Store mobile wallet payment details in dedicated order columns.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS sender_wallet_phone text,
  ADD COLUMN IF NOT EXISTS wallet_transaction_id text;

-- Recover details already written into the order notes.
UPDATE public.orders
SET
  sender_wallet_phone = COALESCE(
    NULLIF(BTRIM(sender_wallet_phone), ''),
    NULLIF(BTRIM(substring(notes from 'رقم[[:space:]]+المحفظة:[[:space:]]*([^|]+)')), '')
  ),
  wallet_transaction_id = COALESCE(
    NULLIF(BTRIM(wallet_transaction_id), ''),
    NULLIF(BTRIM(substring(notes from 'رقم[[:space:]]+العملية:[[:space:]]*([^|]+)')), '')
  )
WHERE notes IS NOT NULL
  AND (
    (sender_wallet_phone IS NULL AND notes LIKE '%رقم المحفظة:%')
    OR (wallet_transaction_id IS NULL AND notes LIKE '%رقم العملية:%')
  );

CREATE OR REPLACE FUNCTION public.sync_order_wallet_payment_details()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.notes IS NOT NULL THEN
    NEW.sender_wallet_phone := COALESCE(
      NULLIF(BTRIM(NEW.sender_wallet_phone), ''),
      NULLIF(BTRIM(substring(NEW.notes from 'رقم[[:space:]]+المحفظة:[[:space:]]*([^|]+)')), '')
    );
    NEW.wallet_transaction_id := COALESCE(
      NULLIF(BTRIM(NEW.wallet_transaction_id), ''),
      NULLIF(BTRIM(substring(NEW.notes from 'رقم[[:space:]]+العملية:[[:space:]]*([^|]+)')), '')
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_order_wallet_payment_details ON public.orders;
CREATE TRIGGER sync_order_wallet_payment_details
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_wallet_payment_details();
