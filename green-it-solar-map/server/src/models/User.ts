import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    email: string;
    projects: Schema.Types.ObjectId[];
}

const userSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;