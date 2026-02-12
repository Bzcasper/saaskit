# Database & Stripe Setup Guide

## Overview

This guide walks you through setting up the Deno KV database and Stripe payment
integration for trendradar.

---

## 1. Database Setup (Deno KV)

Deno KV is built into Deno and requires no additional installation.

### Default Configuration

By default, Deno KV uses a local SQLite database in the `--unstable-kv` mode:

```bash
# Development (uses in-memory or local file)
deno task start
```

### Environment Variables

Optional: Set a custom database path:

```bash
# .env
DENO_KV_PATH=./kv.db
```

### Database Tasks

Available database commands:

```bash
# Seed database with sample data
deno task db:seed

# Export database to JSON
deno task db:dump > backup.json

# Restore database from JSON
deno task db:restore backup.json

# Reset database (WARNING: Destructive)
deno task db:reset

# Run migrations
deno task db:migrate
```

### Data Models

The database stores the following entities:

- **Items**: Music discoveries/trends
- **Users**: User accounts with GitHub OAuth
- **Votes**: User votes on items
- **Sessions**: User session data

### Example: Seed Data

```bash
# Populate with sample data
deno task db:seed

# Verify data
deno task db:dump | head -50
```

---

## 2. Stripe Setup

### Prerequisites

1. [Stripe Account](https://stripe.com) (free to create)
2. [Stripe CLI](https://stripe.com/docs/stripe-cli) installed

### Step 1: Get Test API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to [Developers > API Keys](https://dashboard.stripe.com/test/apikeys)
4. Copy your **Secret key** (starts with `sk_test_`)

### Step 2: Configure Environment Variables

Update `.env` file:

```bash
STRIPE_SECRET_KEY=sk_test_...your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_...to_be_filled_after_cli_setup
STRIPE_PREMIUM_PLAN_PRICE_ID=price_...to_be_filled_after_init
```

### Step 3: Initialize Stripe Products

Run the initialization script:

```bash
deno task init:stripe
```

This will:

- Create a "Premium" product ($5/month)
- Set up customer portal configuration
- Output the `STRIPE_PREMIUM_PLAN_PRICE_ID` to add to `.env`

### Step 4: Set Up Stripe CLI for Webhooks

Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with scoop)
scoop install stripe

# Linux
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

Log in to Stripe CLI:

```bash
stripe login
```

Start webhook forwarding:

```bash
stripe listen --forward-to localhost:8000/api/stripe-webhooks
```

Copy the webhook signing secret (starts with `whsec_`) and add to `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret_here
```

### Step 5: Test Stripe Integration

1. Start the server:
   ```bash
   deno task start
   ```

2. Navigate to `/pricing`

3. Click "Upgrade Now" on Premium plan

4. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

---

## Production Setup

### Database (Production)

For production, Deno KV uses [Deno Deploy KV](https://deno.com/kv):

1. Deploy to [Deno Deploy](https://deno.com/deploy)
2. KV is automatically provisioned
3. No configuration needed - Deno manages it

### Stripe (Production)

1. Activate your [Stripe account](https://dashboard.stripe.com/account/overview)
2. Switch to **Live mode** in dashboard
3. Generate live API keys
4. Update environment variables with live keys
5. Set up production webhook endpoint in Stripe dashboard
6. Update webhook URL in your deployment

---

## Troubleshooting

### Database Issues

**Error: "Deno.openKv is not a function"**

- Make sure you're using Deno 1.40 or later
- Run with `--unstable-kv` flag (already configured in deno.json)

**Error: "Permission denied"**

- Check file permissions for KV database file
- Ensure DENO_KV_PATH is accessible

### Stripe Issues

**Error: "Stripe is disabled"**

- Check that `STRIPE_SECRET_KEY` is set in `.env`
- Ensure key starts with `sk_test_` (test) or `sk_live_` (production)
- Restart the server after updating .env

**Error: "No such price"**

- Run `deno task init:stripe` to create the product
- Copy the price ID to `.env`
- Restart server

**Webhooks not working**

- Ensure Stripe CLI is running with `stripe listen`
- Check webhook secret is correct in `.env`
- Verify webhook URL matches your local server

---

## Quick Reference

### Environment Variables

```bash
# Required for OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Required for Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PLAN_PRICE_ID=price_...

# Optional
DENO_KV_PATH=./kv.db
```

### Useful Commands

```bash
# Start development server
deno task start

# Database operations
deno task db:seed
deno task db:dump > backup.json
deno task db:restore backup.json
deno task db:reset

# Stripe operations
deno task init:stripe
stripe listen --forward-to localhost:8000/api/stripe-webhooks

# Check types and lint
deno task ok
```

---

## Next Steps

1. ✅ Set up GitHub OAuth (already configured)
2. ✅ Set up Deno KV database (automatic)
3. ⏳ Configure Stripe test keys
4. ⏳ Run `deno task init:stripe`
5. ⏳ Start Stripe CLI for webhooks
6. ⏳ Test payment flow
7. 🚀 Deploy to production

For help, see:

- [Deno KV Documentation](https://deno.com/kv)
- [Stripe Documentation](https://stripe.com/docs)
- [Fresh Documentation](https://fresh.deno.dev/)
