const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const StripeService = {
    createAccount: async (user) => {
        const account = await stripe.accounts.create({
            type: 'express',
            business_type: "individual",
            individual: {
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
        return account;
    },

    retrieveAccount: async (accountId) => {
        const account = await stripe.accounts.retrieve(accountId);
        return account;
    },

    createAccountLink: async (stripeAccountId, accountLinkType) => {
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: process.env.NODE_ENVIRONMENT == 'development'
                ? `http://localhost:${process.env.PORT}/stripe/onboarding/unsuccessful`
                : 'https://api.rentngo.online/stripe/onboarding/unsuccessful',
            return_url: process.env.NODE_ENVIRONMENT == 'development'
                ? `http://localhost:${process.env.PORT}/stripe/onboarding/successful`
                : 'https://api.rentngo.online/stripe/onboarding/successful',
            type: accountLinkType,
        });
        return accountLink;
    },

    createCustomer: async (user) => {
        const customer = await stripe.customers.create({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone
        });
        return customer;
    },

    retrieveCustomer: async (customerId) => {
        const customer = await stripe.customers.retrieve(customerId);
        return customer;
    },

    createPaymentIntent: async (amount, currency, stripeAccountId, stripeCustomerId) => {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount < 100 ? 100 : amount,
            currency: currency.toLowerCase(),
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            application_fee_amount: parseInt(amount * 0.15),
            transfer_data: {
                destination: stripeAccountId,
            },
        });
        return paymentIntent;
    },

    retrievePaymentIntent: async (stripePaymentIntentId) => {
        const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
        return paymentIntent;
    },

    cancelPaymentIntent: async (stripePaymentIntentId) => {
        const paymentIntent = await stripe.paymentIntents.cancel(stripePaymentIntentId);
        return paymentIntent;
    },

    refundPaymentIntent: async (stripePaymentIntentId, price, percentageOfRefund) => {
        const refund = await stripe.refunds.create({
            payment_intent: stripePaymentIntentId,
            amount: (percentageOfRefund / 100) * (price * 100)
        });
        return refund;
    },

    constructEvent: async (body, signature) => {
        let event = await stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SIGNING_SECRET);
        return event;
    }
}

module.exports = StripeService;

