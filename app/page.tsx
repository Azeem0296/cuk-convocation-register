// app/page.tsx

'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Using path alias

// This component handles the actual logic
const LoginPageClient: React.FC = () => {

    const router = useRouter(); // --- Get the router
    const searchParams = useSearchParams();

    // --- Get error from URL (for redirects from the form page, just in case)
    const urlError = searchParams.get('error');

    // --- State for new errors that happen ON this page
    const [localError, setLocalError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Tracks login/verification process

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setLocalError(null); // Clear old errors

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // --- Redirect back to THIS page after login ---
                redirectTo: `${window.location.origin}` // Redirect to home page (which is this page)
            }
        });
    };

    // --- This effect runs when Google redirects back to this page ---
    useEffect(() => {
        const verifyUserAndRoute = async () => {
            console.log("verifyUser effect running...");

            const { data: { session } } = await supabase.auth.getSession();
            console.log("Session fetched:", !!session);

            // Only proceed if a session exists AND we haven't already processed an error
            if (session && !urlError && !localError) {
                console.log("Session exists, attempting verification...");
                setIsLoading(true);
                const accessToken = session.access_token;

                // Clear hash early
                if (window.location.hash.includes('access_token')) {
                    console.log("Clearing URL hash");
                    window.history.replaceState(null, '', window.location.pathname);
                }

                try {
                    console.log("Fetching student details for routing...");
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-student-info-by-auth`,
                        {
                            method: 'POST', // Or 'GET'
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        }
                    );

                    const data = await response.json();
                    console.log("Fetch response received, ok:", response.ok, "Status:", response.status);

                    if (!response.ok) {
                        // --- FAILURE (e.g., email not found - Status 404) ---
                        console.log("Fetch failed, setting error:", data.error);
                        setLocalError(data.error || "Verification failed. Please try again.");
                        await supabase.auth.signOut();
                        console.log("User signed out due to verification failure.");
                    } else {
                        // --- SUCCESS (Email Found) ---
                        console.log("Fetch successful! Checking registration status:", data.is_registered);

                        // *** ROUTING LOGIC ***
                        if (data.is_registered === true) {
                            console.log("User already registered, navigating to /your-ticket...");
                            router.push('/your-ticket'); // Go directly to ticket page
                        } else {
                            console.log("User not registered, navigating to /form...");
                            router.push('/form'); // Go to registration form
                        }
                        // *** END ROUTING LOGIC ***
                    }
                } catch (err: any) {
                    console.error("Error during fetch/verification:", err);
                    setLocalError(err.message || "Failed to connect to server.");
                    await supabase.auth.signOut();
                    console.log("User signed out due to catch block error.");
                } finally {
                    // Don't set loading false immediately if redirecting,
                    // but set it if staying on page due to error
                    if (localError) setIsLoading(false);
                    console.log("Verification process finished.");
                }
            } else {
                console.log("Skipping verification. Session:", !!session, "urlError:", urlError, "localError:", localError);
                if (!session && !urlError && !localError) {
                    setIsLoading(false);
                }
            }
        };
        verifyUserAndRoute();
        // dependency array ensures this runs when component mounts or relevant params change
    }, [router, urlError, localError]);

    // Show the localError first, then fall back to the URL error
    const error = localError || urlError;

    return (
        <div
            className="relative flex items-center justify-center min-h-screen font-sans p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/college-bg.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative z-10 w-full max-w-md p-10 bg-black/30 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 text-center">

                <img
                    src="/cuk-logo.png"
                    alt="University Logo"
                    className="w-24 h-24 mx-auto mb-6 rounded-full shadow-md object-cover"
                />

                <h1 className="text-3xl font-bold text-white mb-2">
                    Convocation 2025
                </h1>
                <p className="text-lg text-gray-200 mb-8">
                    Please sign in to register.
                </p>

                {/* --- Error Message Display --- */}
                {error && (
                    <div className="mb-4 p-3 rounded-md text-center text-sm font-medium bg-red-500/50 text-white">
                        {error}
                    </div>
                )}

                {/* Show a different button/message while loading/verifying */}
                {isLoading ? (
                    <div className="py-3 px-4 text-white font-medium">
                        Verifying...
                    </div>
                ) : (
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-800 rounded-md shadow-lg font-medium transition-all duration-300 hover:bg-gray-200 transform hover:-translate-y-0.5"
                    >
                        {/* Google Icon SVG */}
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.836 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                        Sign in with Google
                    </button>
                )}
            </div>
        </div>
    );
};

// This wrapper component provides the Suspense boundary
// Needed because LoginPageClient uses useSearchParams
export default function HomePage() { // Changed name to reflect it's the home page
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-white bg-black/50">Loading...</div>}>
            <LoginPageClient />
        </Suspense>
    );
}