import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to predict energy generation
export const predictEnergy = async (locationData: {
  lat: number;
  lng: number;
  area_sq_ft: number;
  panel_efficiency: number;
}) => {
    try {
        const response = await apiClient.post('/predict-energy', locationData);
        return response.data;
    } catch (error) {
        console.error('Error predicting energy:', error);
        throw error;
    }
};

// Function to get user data
export const getUserData = async (userId: string) => {
    try {
        // Use the configured apiClient instance
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

// Function to save user project
export const saveUserProject = async (userId: string, projectData: { name: string; location: object }) => {
    try {
        // Use the configured apiClient instance
        const response = await apiClient.post(`/users/${userId}/projects`, projectData);
        return response.data;
    } catch (error) {
        console.error('Error saving user project:', error);
        throw error;
    }
};

// This function needs to be exported so DashboardPage can import it.
export const fetchEnergyData = async (projectId: string) => {
  console.log(`Fetching data for project ${projectId}`);
  // Mock data for demonstration purposes
  return Promise.resolve({
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    consumption: [65, 59, 80, 81, 56, 55],
    generation: [45, 49, 60, 71, 46, 40],
  });
};