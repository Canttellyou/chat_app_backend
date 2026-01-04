import mongoose from "mongoose";
declare const Message: mongoose.Model<{
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content?: string | null;
    attachment?: string | null;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content?: string | null;
    attachment?: string | null;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content?: string | null;
    attachment?: string | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content?: string | null;
    attachment?: string | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content?: string | null;
    attachment?: string | null;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content?: string | null;
    attachment?: string | null;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Message;
//# sourceMappingURL=Message.d.ts.map