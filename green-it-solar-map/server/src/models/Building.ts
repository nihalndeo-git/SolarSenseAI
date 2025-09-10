import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilding extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    area_sq_ft: number;
    predictions: Array<{
        energy_output_kwh: number;
        carbon_reduction_tons: number;
        estimated_savings: number;
    }>;
}

const BuildingSchema: Schema = new Schema({
    user_id: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    area_sq_ft: { type: Number, required: true },
    predictions: [{
        energy_output_kwh: { type: Number, required: true },
        carbon_reduction_tons: { type: Number, required: true },
        estimated_savings: { type: Number, required: true },
    }],
});

export default mongoose.model<IBuilding>('Building', BuildingSchema);