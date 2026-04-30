-- Wishlist table schema
CREATE TABLE IF NOT EXISTS wishlist (
    wishlist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users_account(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_item (
    wishlist_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES wishlist(wishlist_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (wishlist_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item_wishlist_id ON wishlist_item(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item_product_id ON wishlist_item(product_id);

DROP TRIGGER IF EXISTS trg_wishlist_updated_at ON wishlist;
CREATE TRIGGER trg_wishlist_updated_at
BEFORE UPDATE ON wishlist
FOR EACH ROW
EXECUTE FUNCTION touch_updated_at();
