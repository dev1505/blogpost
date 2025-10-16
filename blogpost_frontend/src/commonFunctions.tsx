import axios from "axios";

export type ApiResquestType = {
    type: string;
    url: string;
    payload?: object;
    publicPage?: boolean;
}

export const fastapi_backend_url = "https://effective-couscous-q59v65p6wgq2rj9-8001.app.github.dev/api"

export async function CommonApiCall({ type = "get", payload = {}, url, publicPage = false }: ApiResquestType) {
    try {
        let response;
        if (type === "get") {
            response = await axios.get(
                url,
                { withCredentials: true }
            );
        }
        else {
            response = await axios.post(
                url,
                payload,
                { withCredentials: true }
            );
        }
        const response_data = await response.data;
        return response_data
    } catch (response_error) {
        if (response_error?.status === 401) {
            try {
                const response = await axios.get(fastapi_backend_url + "/refresh", { withCredentials: true });
                const response_data = response.data;
                if (response_data.success) {
                    window.location.href = "/"
                }
            } catch (error) {
                if (!publicPage) {
                    window.location.href = "/auth";
                }
            }
        }
        return false;
    }
}