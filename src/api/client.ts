export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function postDiagnosis(data: any) {
    const response = await fetch(`${API_BASE_URL}/diagnosis`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}
