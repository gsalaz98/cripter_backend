import mongoose from 'mongoose';

export interface SubscriptionModel extends mongoose.Document {
    subscriptionId: number,
    createdOn: Date,
    subscriptionExpires: boolean, 
    expiryDate: Date
}

export const SubscriptionSchema = new mongoose.Schema({
    title: String,
    description: String,
    apiIdentifier: String,

    dataSource: String,
    dataSourceCollection: String,
    articStore: Boolean,

    subscriptionId: Number,
    dataTypeId: Number,
    dataTypeString: String,
});

export const Subscription = mongoose.model<SubscriptionModel>('Subscription', SubscriptionSchema);