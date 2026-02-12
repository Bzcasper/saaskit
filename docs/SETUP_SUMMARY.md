# Database & Stripe Setup Summary

## ✅ Current Status

### Database (Deno KV)
- **Status**: ✅ Ready to use
- **Type**: Deno KV (built-in, no setup required)
- **Location**: In-memory (development) or Deno Deploy KV (production)
- **Features**: Automatic, serverless, zero-config

### Stripe
- **Status**: ⚠️ Configuration needed
- **Current**: Placeholder values in `.env`
- **Action Required**: Add actual Stripe test keys

---

## 🚀 Quick Setup Guide

### Step 1: Database (Already Ready!)

Deno KV is built-in and requires no setup. It's already working!

```bash
# Verify database is working
deno task db:dump

# Seed with sample data (fetches from Hacker News)
deno task db:seed

# Reset if needed
deno task db:reset
```

### Step 2: Get Stripe Test Keys

1. Create a free Stripe account at https://stripe.com
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy your **Secret key** (starts with `sk_test_`)

### Step 3: Configure Environment Variables

Edit `.env` file:

```bash
# .env
GITHUB_CLIENT_ID=Ov23liA8hxCLAyMLnQmT
GITHUB_CLIENT_SECRET=dad52b30f433e8cd77548b17bffaba9d6b98098b

# Replace with your actual Stripe test key
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

### Step 4: Initialize Stripe Products

```bash
# This creates the Premium plan in Stripe
deno task init:stripe
```

Copy the output (starts with `price_`) and add to `.env`:

```bash
STRIPE_PREMIUM_PLAN_PRICE_ID=price_your_price_id_here
```

### Step 5: Start Stripe CLI for Webhooks

```bash
# Install Stripe CLI first, then:
stripe login
stripe listen --forward-to localhost:8000/api/stripe-webhooks
```

Copy the webhook secret (starts with `whsec_`) and add to `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 6: Start the Server

```bash
deno task start
```

Visit http://localhost:8000

---

## 📊 Database Structure

### Entities

1. **Items** - Music discoveries/trends
   ```typescript
   {
     id: string (ULID)
     userLogin: string
     title: string
     url: string
     score: number
   }
   ```

2. **Users** - User accounts
   ```typescript
   {
     login: string
     sessionId: string
     isSubscribed: boolean
     stripeCustomerId?: string
   }
   ```

3. **Votes** - User votes on items
   ```typescript
   {
     itemId: string
     userLogin: string
   }
   ```

### Available Commands

```bash
# Database
deno task db:seed      # Populate with sample data
deno task db:dump      # Export to JSON
deno task db:restore   # Import from JSON
deno task db:reset     # Clear all data (destructive)
deno task db:migrate   # Run migrations

# Stripe
deno task init:stripe  # Create Premium plan

# Development
deno task start        # Start dev server
deno task test         # Run tests
deno task ok          # Check everything
```

---

## 💳 Stripe Configuration Details

### Test Card Numbers

Use these for testing payments:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0000 0000 0341` | ❌ Insufficient funds |

**Use any:**
- Future expiry date (MM/YY)
- Any 3-digit CVC
- Any ZIP code

### Pricing Tiers

The `init:stripe` script creates:

**Premium Plan**
- Price: $5.00/month
- Features: Premium badge, priority support, advanced analytics
- Subscription: Monthly recurring

### Webhook Events

Stripe CLI forwards these events:
- `customer.subscription.created`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## 🔧 Troubleshooting

### Database Issues

**Problem**: "Permission denied"
```bash
# Solution: Check Deno has KV permissions
deno --version  # Should be 1.40+
# The --unstable-kv flag is already in deno.json
```

**Problem**: "Database is empty"
```bash
# Solution: Seed the database
deno task db:seed
```

### Stripe Issues

**Problem**: "Stripe is disabled"
```bash
# Solution: Add STRIPE_SECRET_KEY to .env
# Make sure it starts with 'sk_test_' for test mode
```

**Problem**: "No such price"
```bash
# Solution: Run initialization
deno task init:stripe
# Then copy the price ID to .env
```

**Problem**: "Webhook signature verification failed"
```bash
# Solution: Ensure Stripe CLI is running
stripe listen --forward-to localhost:8000/api/stripe-webhooks
# And STRIPE_WEBHOOK_SECRET is set correctly
```

---

## 📈 Production Deployment

### Database

Deno KV on Deno Deploy is **automatic**:
- No configuration needed
- Globally distributed
- Pay only for usage

### Stripe

1. Activate your Stripe account
2. Switch to Live mode
3. Generate live API keys
4. Update environment variables:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PREMIUM_PLAN_PRICE_ID=price_...
   ```
5. Set up production webhook URL in Stripe Dashboard
6. Deploy to Deno Deploy

---

## 📁 Environment Variables Reference

```bash
# Required for OAuth
GITHUB_CLIENT_ID=your_github_app_id
GITHUB_CLIENT_SECRET=your_github_app_secret

# Required for Stripe payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PLAN_PRICE_ID=price_...

# Optional
DENO_KV_PATH=./kv.db  # Custom DB path
GA4_MEASUREMENT_ID=G-...  # Google Analytics
```

---

## ✅ Setup Checklist

- [ ] GitHub OAuth configured (✅ already done)
- [ ] Database ready (✅ Deno KV automatic)
- [ ] Stripe account created
- [ ] Stripe test keys added to .env
- [ ] Stripe products initialized
- [ ] Stripe CLI installed and running
- [ ] Webhook secret configured
- [ ] Server started and tested
- [ ] Payment flow tested with test cards

---

## 🎯 Next Steps

1. **Get Stripe keys**: Sign up at stripe.com and copy test keys
2. **Run init:stripe**: Creates Premium plan
3. **Start Stripe CLI**: For webhook forwarding
4. **Test payments**: Use test card numbers
5. **Deploy**: Push to Deno Deploy

---

## 📚 Documentation

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Detailed database & Stripe guide
- [Branding Guide](BRANDING_GUIDE.md) - UI/UX guidelines
- [Stripe Docs](https://stripe.com/docs)
- [Deno KV Docs](https://deno.com/kv)

---

**Need Help?**
- Check logs: `deno task start` output
- Test database: `deno task db:dump`
- Verify Stripe: `stripe logs tail`
- Join Discord: https://discord.gg/trendradar
