import mongoose, { Schema, type Document } from "mongoose"

export interface ISubscriber extends Document {
  email: string
}

const subscriberSchema: Schema<ISubscriber> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
})

const SubscriberModel = mongoose.models.Subscriber || mongoose.model<ISubscriber>("Subscriber", subscriberSchema)

// Add named export
export { SubscriberModel as Subscriber }

// Keep default export for backward compatibility
export default SubscriberModel
