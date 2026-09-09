import api from "./api";

export const getOffboardings = async () => {
    const response = await api.get("/offboarding");

    return response.data;
};

export const getOffboarding = async (id) => {
    const response = await api.get(
        `/offboarding/${id}`
    );

    return response.data;
};

export const createOffboarding = async (
    offboardingData
) => {
    const response = await api.post(
        "/offboarding",
        offboardingData
    );

    return response.data;
};

export const sendReminder = async (id) => (await api.post(`/offboarding/${id}/reminder`)).data;
