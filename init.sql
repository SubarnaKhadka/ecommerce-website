CREATE TABLE site_user(
    id BIGSERIAL PRIMARY KEY,
    email_address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
     CHECK (email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
     CHECK (phone_number ~ '^\+?[0-9]{7,15}$')
);

CREATE UNIQUE INDEX site_user_email_lower_idx ON site_user (LOWER(email_address));


CREATE TABLE country  (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    iso_code CHAR(2) UNIQUE NOT NULL
);

CREATE UNIQUE INDEX country_name_lower_idx ON country (LOWER(name));


CREATE TABLE address (
    id BIGSERIAL PRIMARY KEY,
    unit_number VARCHAR(20),
    street_number VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country_id BIGINT NOT NULL REFERENCES country(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX idx_user_address_country_id ON address (country_id);
CREATE INDEX idx_user_address_postal_code ON address(postal_code);


CREATE TABLE user_address  (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES site_user(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    address_id BIGINT NOT NULL REFERENCES address(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    is_default boolean DEFAULT true
);

CREATE INDEX idx_user_address_user_id ON user_address(user_id);
CREATE INDEX idx_user_address_address_id ON user_address(address_id);


CREATE TABLE product_category  (
id BIGSERIAL PRIMARY KEY,
parent_category_id BIGINT  NULL REFERENCES product_category(id) ON DELETE SET NULL,
category_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE INDEX idx_product_category_parent_id ON product_category(parent_category_id);


CREATE TABLE variation(
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES product_category(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

CREATE INDEX idx_variation_category_id ON variation(category_id);


CREATE TABLE variation_option(
    id BIGSERIAL PRIMARY KEY,
    variation_id BIGINT NOT NULL REFERENCES variation(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL
);

CREATE INDEX idx_variation_option_variation_id ON variation_option(variation_id);


CREATE TABLE product(
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES product_category(id) ON DELETE CASCADE,
    name VARCHAR(255),
    description text,
    product_image VARCHAR(255)
);

CREATE INDEX idx_product_category_id ON product(category_id);


CREATE TABLE product_item(
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL UNIQUE,
    qty_in_stock INT DEFAULT 0,
    product_image VARCHAR(255),
    price NUMERIC(10,2) NOT NULL
);
CREATE INDEX idx_product_item_product_id ON product_item(product_id);


CREATE TABLE product_configuration(
    id BIGSERIAL PRIMARY KEY,
    product_item_id BIGINT NOT NULL REFERENCES product_item(id) ON DELETE CASCADE,
    variation_option_id BIGINT NOT NULL REFERENCES variation_option(id) ON DELETE CASCADE,
    UNIQUE(product_item_id, variation_option_id)
);


CREATE TABLE promotion (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_rate INT DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
    end_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ
);


CREATE TABLE promotion_category (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL REFERENCES  promotion(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES  product_category(id) ON DELETE CASCADE,
    UNIQUE(promotion_id,category_id)
);

CREATE INDEX idx_promotion_category_promotion_id ON promotion_category(promotion_id);
CREATE INDEX idx_promotion_category_category_id ON promotion_category(category_id);


CREATE TABLE payment_type(
    id BIGSERIAL PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE user_payment_method(
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES site_user(id) ON DELETE CASCADE,
    payment_type_id BIGINT NOT NULL  REFERENCES payment_type(id) ON DELETE CASCADE,
    provider VARCHAR(255),
    account_number VARCHAR(100),
    expiry_date TIMESTAMPTZ,
    is_default boolean DEFAULT FALSE,
    UNIQUE(user_id, payment_type_id,account_number)
);


CREATE TABLE shopping_cart(
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES site_user(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);


CREATE TABLE shopping_cart_item(
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES shopping_cart(id) ON DELETE CASCADE,
    product_item_id BIGINT NOT NULL REFERENCES product_item(id) ON DELETE CASCADE,
    qty INT DEFAULT 1 CHECK (qty > 0),
    UNIQUE(cart_id,product_item_id)
);


CREATE TABLE shipping_method(
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);


CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TABLE shop_order(
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES site_user(id) ON DELETE CASCADE,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method_id BIGINT REFERENCES user_payment_method(id) ON DELETE SET NULL,
    shipping_address_id BIGINT NOT NULL REFERENCES address(id) ON DELETE RESTRICT,
    shipping_method_id BIGINT NOT NULL REFERENCES shipping_method(id) ON DELETE RESTRICT,
    order_total NUMERIC(10,2) NOT NULL CHECK (order_total >= 0),
    order_status order_status_enum NOT NULL DEFAULT 'pending'
);


CREATE TABLE order_line(
    id BIGSERIAL PRIMARY KEY, 
    product_item_id BIGINT NOT NULL REFERENCES product_item(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES shop_order(id) ON DELETE CASCADE,
    qty INT NOT NULL CHECK (qty > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);


CREATE TABLE user_review(
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES site_user(id) ON DELETE CASCADE,
    ordered_product_id BIGINT NOT NULL REFERENCES shop_order(id) ON DELETE CASCADE,
    rating_value INT CHECK (rating_value > 0 AND rating_value <= 5),
    comment TEXT
);