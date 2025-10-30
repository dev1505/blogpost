import axios from "axios";

export type ApiRequestType = {
    type?: "get" | "post";
    url: string;
    payload?: object;
    publicPage?: boolean;
};

export const fastapi_backend_url = import.meta.env.VITE_FASTAPI_BACKEND_URL;

export async function CommonApiCall({
    type = "get",
    payload = {},
    url,
    publicPage = false,
}: ApiRequestType) {
    try {
        let response;
        const fullUrl = url.startsWith("http") ? url : `${fastapi_backend_url}${url}`;
        if (type === "get") {
            response = await axios.get(fullUrl, { withCredentials: true });
        } else {
            response = await axios.post(fullUrl, payload, { withCredentials: true });
        }
        return response.data;
    } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
            try {
                const refreshResponse = await axios.get(
                    `${fastapi_backend_url}/refresh`,
                    { withCredentials: true }
                );
                const pathname = window.location.pathname;
                if ((refreshResponse?.data?.success || pathname !== "/") && pathname !== "/auth" && publicPage !== true && !pathname.includes("/user/blogs")) {
                    window.location.href = "/"
                }
            } catch (refreshError) {
                console.warn("Refresh failed:", refreshError);
                if (!publicPage) {
                    window.location.href = "/auth";
                }
            }
        }

        else {
            console.error("API Error:", error?.response?.data || error);
        }

        return false;
    }
}
