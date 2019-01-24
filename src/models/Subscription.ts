import mongoose from 'mongoose';

export const SubscriptionSchema = new mongoose.Schema({
    title: String,
    description: String,
    apiIdentifier: String,
    subscriptionId: Number,
    dataSourceId: Number,
    dataTypeId: Number,
});