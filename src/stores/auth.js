import { defineStore } from "pinia";
import { ref } from "vue";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import router from "../router";

export const useAuthStore = defineStore("auth", () => {
    const user = ref({
        memberId: null,
        firstname: "",
        lastName: "",
        username: "",
        role: "",
        position: "",
        phone: "",
        email: "",
    });

    const token = ref(Cookies.get("token") || null);
    const isAuthenticated = ref(!!token.value);

    const initializeAuth = () => {
        if (typeof window !== "undefined") {
            const savedUser = Cookies.get("user");
            const savedToken = Cookies.get("token");

            if (savedUser && savedToken) {
                isAuthenticated.value = true;
                user.value = JSON.parse(savedUser);
                token.value = savedToken;
            }
        }
    };

    function login(userData) {
        try {
            if (!userData) {
                console.error("Invalid login data:", userData);
                throw new Error("Invalid login response");
            }

            console.log("userDataaaaaa", userData);

            user.value = {
                firstname: userData.firstname || "",
                lastname: userData.lastname || "",
                fullName:
                    userData.fullName ||
                    `${userData.firstname || ""} ${userData.lastname || ""}`.trim(),
                username: userData.username || "",
                role: userData.role || "",
                memberId: userData.memberId || "",
                phone: userData.phone || "",
                email: userData.email || "",
                position: userData.position || "",
            };

            console.log("userrrrrr", user.value);


            token.value = userData.token || null;

            const isLocalhost = window.location.hostname === "localhost";

            Cookies.set("token", token.value, {
                expires: 0.125,
                path: "/",
                ...(isLocalhost ? {} : { secure: true }),
            });

            Cookies.set("user", JSON.stringify(user.value), {
                expires: 7,
                path: "/",
                ...(window.location.hostname === "localhost" ? {} : { secure: true }),
            });

            isAuthenticated.value = true;

            switch (user.value.role) {
                case "admin":
                    router.push("/admin");
                    break;
                default:
                    router.push("/home");
            }
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            logout();
            return false;
        }
    }

    function logout() {
        user.value = {
            memberId: null,
            firstname: "",
            lastName: "",
            username: "",
            role: "",
            position: "",
            phone: "",
            email: "",
        };

        token.value = null;
        isAuthenticated.value = false;

        // Clear cookies
        Cookies.remove("token");
        Cookies.remove("user");

        router.push("/");
    }

    return {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        initializeAuth,
    };
});