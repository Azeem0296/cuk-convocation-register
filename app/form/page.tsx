// app/form/page.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Using path alias
import { FaCheckCircle } from 'react-icons/fa';

// --- Types ---
type FormMessage = {
  text: string;
  isSuccess: boolean;
} | null;

const RegistrationPage: React.FC = () => {
  // --- State ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [guests, setGuests] = useState('0');
  const [guestsError, setGuestsError] = useState('');
  const [formMessage, setFormMessage] = useState<FormMessage>(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [isFetchingProfile, setIsFetchingProfile] = useState(true); // Start loading to fetch data
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks submission loading state
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const router = useRouter();

  // --- useEffect: Guard Route and Fetch Data ---
  useEffect(() => {
    const guardAndFetchData = async () => {
      // 1. Guard: Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.push('/'); // Redirect to home/login
        return;
      }
      const accessToken = session.access_token;
      if (!accessToken) {
        await supabase.auth.signOut();
        router.push('/?error=Invalid session. Please log in again.');
        return;
      }

      // 2. Fetch Data
      try {
        console.log("Fetching student details..."); // Debug log
        const response = await fetch(
          // --- *** CORRECTED FUNCTION NAME *** ---
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-student-info-by-auth`,
          // --- *** END CORRECTION *** ---
          {
            method: 'POST', // Or 'GET', ensure your function handles it
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Fetch response status:", response.status); // Debug log

        // --- Handle BOTH OK and ERROR responses ---
        const profile = await response.json(); // Attempt to parse JSON regardless of status

        if (!response.ok) {
           // It's an error (e.g., 404 Not Found, 500 Server Error)
           // Throw the error message provided by the function
           console.error("Fetch Error:", profile.error || `Status ${response.status}`); // Debug log
           throw new Error(profile.error || `Failed to retrieve details (Status: ${response.status})`);
        }

        // --- Response IS OK (200) ---
        console.log("Profile fetched successfully:", profile); // Debug log

        // 3. Pre-fill common data
        setFullName(profile.name || '');
        setEmail(profile.email || '');
        setRollNumber(profile.roll_no || '');
        setDepartment(profile.dept || '');

        // 4. Check registration status from the SUCCESSFUL response
        if (profile.is_registered === true) {
            console.log("User IS registered. Setting to show QR view."); // Debug log
            // --- ALREADY REGISTERED: Show QR Code View Directly ---
            setIsAlreadyRegistered(true);
            setGuests(String(profile.guest_count ?? 0)); // Use nullish coalescing
            setFormMessage({ text: 'Registration Data Loaded', isSuccess: true }); // Trigger QR view
            setInfoMessage(''); // Clear info message if showing QR view
        } else {
            console.log("User is NOT registered. Setting form for input."); // Debug log
            // --- NOT REGISTERED: Prepare form for input ---
            setIsAlreadyRegistered(false);
            setGuests('0');
            setFormMessage(null); // Ensure QR view is hidden
            setInfoMessage(''); // Clear any info message
        }
        // --- End Check ---

      } catch (error: any) {
        // Catch block for fetch errors or errors thrown above
        console.error('Error in guardAndFetchData (form page):', error);
        const encodedError = encodeURIComponent(error.message);
        await supabase.auth.signOut(); // Log out on failure
        router.push(`/?error=${encodedError}`); // Redirect to home/login with error
      } finally {
        setIsFetchingProfile(false); // Done attempting to fetch
      }
    };

    guardAndFetchData();
  }, [router]);


  // --- Handle Guest Input ---
  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAlreadyRegistered) return; // Prevent changes if registered

    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1); // Allow only 0, 1, 2
    setGuests(value);
    setGuestsError(''); // Clear error on change

    // Optional: Real-time validation
    if (value !== '') {
      const count = parseInt(value, 10);
      if (count > 2) {
        setGuestsError('Number of guests must be between 0 and 2.');
      }
    }
  };


  // --- Handle Submit (Register) ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Prevent submission if already registered, fetching profile, or already submitting
    if (isAlreadyRegistered || isFetchingProfile || isSubmitting) return;

    // Clear previous messages
    setGuestsError('');
    setFormMessage(null);
    setInfoMessage('');

    // --- Validation ---
    let isValid = true;
    const guestCount = parseInt(guests, 10);

    if (guests.trim() === '' || isNaN(guestCount) || guestCount < 0 || guestCount > 2) {
      setGuestsError('Number of guests must be between 0 and 2.');
      isValid = false;
    }

    // Check if essential pre-filled data is present
    if (!fullName || !email || !rollNumber || !department) {
      setFormMessage({ text: 'Student data is missing. Please refresh.', isSuccess: false });
      isValid = false;
    }

    if (!isValid) return; // Stop if validation fails

    // --- Get Token for Submission ---
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      setFormMessage({ text: 'Your session expired. Please log in again.', isSuccess: false });
      // Redirect after a short delay
      setTimeout(() => router.push('/'), 3000);
      return;
    }
    const accessToken = session.access_token;

    // --- API Submission ---
    setIsSubmitting(true); // Start submitting loading state
    try {
      const response = await fetch(
        // Ensure this registration function name is correct
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-student-by-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${accessToken}`, // Use user token for registration
          },
          body: JSON.stringify({ guest_count: guestCount }), // Only send guest count
        }
      );

      // --- Handle Submission Response ---
      if (response.ok) {
        router.push('/your-ticket');
        // try {
        //   const data = await response.json(); // May be empty on success
        //   setFormMessage({ text: data.message || 'Registration Successful!', isSuccess: true });
        // } catch {
        //   setFormMessage({ text: 'Registration Successful!', isSuccess: true }); // Assume success if OK but no JSON
        // }
        // setIsAlreadyRegistered(true); // Lock form after success
      } else {
        // Handle errors (409 Conflict, 400 Bad Request etc.)
        let errorData;
        let submitErrorMessage = 'Registration failed. Please try again.';
        try {
          errorData = await response.json();
          if (errorData && errorData.error) {
            submitErrorMessage = errorData.error;
          }
        } catch {
          submitErrorMessage = await response.text() || submitErrorMessage; // Fallback to text
        }

        if (response.status === 409) { // Conflict (Already registered)
          setInfoMessage(submitErrorMessage); // Show as info
          setIsAlreadyRegistered(true); // Ensure form is locked
        } else { // Other errors
          setFormMessage({
            text: submitErrorMessage,
            isSuccess: false,
          });
        }
      }
    } catch (error) {
      console.error('Submission network/fetch failed:', error);
      setFormMessage({
        text: 'Could not connect to the server. Please check your internet connection and try again.',
        isSuccess: false,
      });
    } finally {
      setIsSubmitting(false); // End submitting loading state
    }
  };

  // --- Computed States for Disabling ---
  const isFormValidForSubmit = // Checks if guest count is valid AND profile data loaded
    guests.trim() !== '' &&
    !isNaN(parseInt(guests, 10)) &&
    parseInt(guests, 10) >= 0 &&
    parseInt(guests, 10) <= 2 &&
    fullName !== '' &&
    email !== '' &&
    rollNumber !== '' &&
    department !== '';

  // Button disabled if: fetching profile, submitting, form invalid, or already registered
  const isDisabled = isFetchingProfile || isSubmitting || !isFormValidForSubmit || isAlreadyRegistered;

  // --- JSX ---
  return (
    <div
      className="relative flex items-center justify-center min-h-screen font-sans p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/college-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-lg p-6 sm:p-10 bg-black/30 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
        {/* Success View */}
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img
                  src="/cuk-logo.png" // Make sure this image is in your /public folder
                  alt="University Logo"
                  className="rounded-full shadow-md w-20 h-20 object-cover"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Central University of Kerala
              </h1>
              <p className="text-lg text-gray-200 mt-2">Convocation 2025 Registration</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Info Message */}
              {infoMessage && (
                <div className="mb-4 p-3 rounded-md text-center text-sm font-medium bg-green-500/50 text-white">
                  {infoMessage}
                </div>
              )}
              {/* Error Message */}
              {formMessage && !formMessage.isSuccess && (
                <div className="mb-4 p-3 rounded-md text-center text-sm font-medium bg-red-500/50 text-white">
                  {formMessage.text}
                </div>
              )}

              {/* Loading Indicator while fetching profile */}
              {isFetchingProfile && (
                <div className="text-center text-gray-200 p-4">Loading your details...</div>
              )}

              {/* Form Fields (Show only after profile fetch attempt is complete) */}
              {!isFetchingProfile && (
                <div className="space-y-5">
                  {/* Full Name (Disabled) */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-200 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      readOnly
                      disabled
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-gray-400 rounded-md shadow-sm focus:outline-none cursor-not-allowed"
                      placeholder={fullName ? undefined : "N/A"} // Show N/A if empty after load
                    />
                  </div>

                  {/* Department (Disabled) */}
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-200 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      value={department}
                      readOnly
                      disabled
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-gray-400 rounded-md shadow-sm focus:outline-none cursor-not-allowed"
                      placeholder={department ? undefined : "N/A"}
                    />
                  </div>

                  {/* Email (Disabled) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      readOnly
                      disabled
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-gray-400 rounded-md shadow-sm focus:outline-none cursor-not-allowed"
                      placeholder={email ? undefined : "N/A"}
                    />
                  </div>

                  {/* Roll Number (Disabled) */}
                  <div>
                    <label htmlFor="roll-number" className="block text-sm font-medium text-gray-200 mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      id="roll-number"
                      value={rollNumber}
                      readOnly
                      disabled
                      className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-gray-400 rounded-md shadow-sm focus:outline-none cursor-not-allowed"
                      placeholder={rollNumber ? undefined : "N/A"}
                    />
                  </div>

                  {/* Guests (Editable unless registered) */}
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-200 mb-1">
                      Number of Guests (Max 2)
                    </label>
                    <input
                      type="number"
                      id="guests"
                      value={guests}
                      onChange={handleGuestsChange}
                      disabled={isAlreadyRegistered} // Disable based on state
                      aria-readonly={isAlreadyRegistered}
                      maxLength={1}
                      inputMode="numeric"
                      className={`w-full px-4 py-2 border rounded-md shadow-sm ${isAlreadyRegistered
                          ? 'border-gray-600 bg-gray-800 text-gray-400 cursor-not-allowed' // Style when disabled
                          : 'border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400' // Style when enabled
                        }`}
                      placeholder="0"
                    />
                    {guestsError && <p className="text-red-400 text-xs font-medium mt-1">{guestsError}</p>}
                  </div>
                </div>
              )}

              {/* Submit Button (Show only when not fetching, data loaded, and not registered) */}
              {!isFetchingProfile && !isAlreadyRegistered && ( // Hide button if already registered
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isDisabled} // Use combined disabled state
                    className={`w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none transition-all duration-300 ${isDisabled ? 'bg-blue-600/25 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {isSubmitting ? ( // Show spinner when submitting
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Register' // Default text
                    )}
                  </button>
                </div>
              )}
            </form>
          </>
      </div>
    </div>
  );
};

export default RegistrationPage;