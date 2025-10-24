'use client'; // Add this if using Next.js App Router

import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa'; // --- ADDED: Import the checkmark icon
import { FaArrowRight } from 'react-icons/fa';

// Define a type for the form message for better clarity
type FormMessage = {
    text: string;
    isSuccess: boolean;
} | null;

/**
 * A React component for the Convocation Registration page.
 * This component manages its own state for form inputs, validation, and error handling.
 */
const RegistrationPage: React.FC = () => {
    // --- State for Form Inputs ---
    const [name, setName] = useState<string>('');
    const [rollNumber, setRollNumber] = useState<string>('');
    const [guests, setGuests] = useState<string>('0');

    // --- State for Error Messages ---
    const [nameError, setNameError] = useState<string>('');
    const [rollNumberError, setRollNumberError] = useState<string>('');
    const [guestsError, setGuestsError] = useState<string>('');
    
    // --- State for General Form Message (Success/Failure) ---
    const [formMessage, setFormMessage] = useState<FormMessage>(null);
    
    // --- State for Submission Loading ---
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * Handles changes to the Roll Number input.
     */
    const handleRollNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/[^0-9]/g, '');
        setRollNumber(numericValue.slice(0, 10));
    };

    /**
     * Handles changes to the Guests input.
     */
    /**
     * Handles changes to the Guests input.
     * Restricts to 1 digit and validates in real-time.
     */
    const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Remove any non-digit characters
        const numericValue = value.replace(/[^0-9]/g, '');
        
        // Truncate to 1 digit
        const finalValue = numericValue.slice(0, 1);

        // Update the state immediately so the user sees the digit
        setGuests(finalValue);

        // --- Real-time Validation Logic ---
        if (finalValue === '') {
            // If the field is empty, clear any errors.
            // The submit handler will catch it if it's still empty.
            setGuestsError('');
        } else {
            const guestsCount = parseInt(finalValue, 10);
            
            if (guestsCount > 2) {
                // If the number is > 3, show the error immediately
                setGuestsError('Number of guests must be between 0 and 2.');
            } else {
                // Otherwise, the number is valid (0, 1, 2, or 3), so clear the error.
                setGuestsError('');
            }
        }
    };

        /**
     * Handles changes to the Name input.
     * Validates in real-time to only allow letters and spaces.
     */
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // This regex checks if the string contains ONLY letters, spaces, or is empty.
        const nameRegex = /^[A-Za-z\s]*$/;

        if (nameRegex.test(value)) {
            // If the value is valid (or empty), update the state and clear any error
            setName(value);
            setNameError('');
        } else {
            // If the value is invalid (e.g., contains a number),
            // still update the state so the user sees what they typed,
            // but immediately show the error message.
            setName(value);
            setNameError('Name must only contain letters and spaces.');
        }
    };

    /**
     * Handles the form submission event.
     */
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let isValid = true;

        // --- 1. Clear all previous errors ---
        setNameError('');
        setRollNumberError('');
        setGuestsError('');
        setFormMessage(null);

        // --- 2. Validate Name ---
        const nameValue = name.trim();
        const nameRegex = /^[A-Za-z\s]+$/;
        if (nameValue === '') {
            isValid = false;
            setNameError('Full Name is required.');
        } else if (nameValue.length < 3) {
            isValid = false;
            setNameError('Name must be at least 3 characters long.');
        } else if (!nameRegex.test(nameValue)) {
            isValid = false;
            setNameError('Name must only contain letters and spaces.');
        }

        // --- 3. Validate Roll Number ---
        const rollNumberValue = rollNumber.trim();
        const rollNumberRegex = /^\d{10}$/;
        if (rollNumberValue === '') {
            isValid = false;
            setRollNumberError('Roll Number is required.');
        } else if (!rollNumberRegex.test(rollNumberValue)) {
            isValid = false;
            setRollNumberError('Roll Number must be exactly 10 numeric digits.');
        }

        // --- 4. Validate Number of Guests ---
        if (guests === '') {
            isValid = false;
            setGuestsError('Please enter the number of guests (0-2).');
        } else {
            const guestsCount = parseInt(guests, 10);
            if (isNaN(guestsCount) || guestsCount < 0 || guestsCount > 2) {
                isValid = false;
                setGuestsError('Number of guests must be between 0 and 2.');
            }
        }

       // --- 5. Handle Final Outcome ---
        if (isValid) {
            // --- SUCCESS ---
            // 1. SET LOADING STATE FIRST
            setIsLoading(true);
            setFormMessage(null); // Clear any old errors

            // 2. Simulate API call
            setTimeout(() => {
                console.log('Form data submitted:', { name, rollNumber, guests });

                // 3. AFTER API call is "done", set success message
                setIsLoading(false); 
                setFormMessage({ text: 'Registration Successful!', isSuccess: true });

            }, 2000); // Keep simulation time (e.g., 2 seconds)

        } else {
            // --- FAILURE ---
            setFormMessage({ text: 'Please correct the errors in the form.', isSuccess: false });
        }
    };

        // --- ADDED: Real-time form validity check ---
    // This will be used to enable/disable the submit button.
    // It mirrors the basic validation logic from handleSubmit.
    const isFormValid = 
        name.trim().length >= 3 &&         // Name is at least 3 chars
        /^\d{10}$/.test(rollNumber) &&     // Roll number is exactly 10 digits
        guests.trim() !== '' &&            // Guests field is not empty
        !isNaN(parseInt(guests, 10)) &&    // Guests is a number
        parseInt(guests, 10) >= 0 &&       // Guests is 0 or more
        parseInt(guests, 10) <= 3;         // Guests is 3 or less

    // --- JSX Rendering ---
    // Note: We assume Tailwind CSS is set up...
    const isDisabled = isLoading || !isFormValid;
        // ... rest of your JSX

    return (
        <div 
            className="relative flex items-center justify-center min-h-screen font-sans p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/college-bg.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative z-10 w-full max-w-lg p-6 sm:p-10 bg-black/30 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
                
                {/* --- CHANGED: Conditional Rendering Logic --- */}
                {/* If form is successful, show the success view. Otherwise, show the form. */}
                {formMessage && formMessage.isSuccess ? (
                    
                    // --- SUCCESS VIEW (NOW WITH QR CODE) ---
                    <div className="text-center text-white py-8 px-4">
                        
                        {/* --- CHANGED: Replaced icon with QR Code Image --- */}
                        <div className="flex justify-center mb-6">
                            <img 
                                src="/qr-code.png" // This points to your /public/qr-code.png
                                alt="Convocation Entry QR Code" 
                                // Added white background & padding to make the QR scannable
                                className="bg-white p-3 rounded-lg shadow-xl"
                                width={180} // Set a good size for scannability
                                height={180}
                            />
                        </div>
                        
                        <h2 className="text-3xl font-bold mb-2">
                            Registration Successful!
                        </h2>
                        <p className="text-gray-200 text-lg">
                            Please take a screenshot of this QR code for entry and this will send to your mail also.
                        </p>
                    </div>

                ) : (
                    
                    // --- EXISTING FORM (wrapped in the 'else' part of the condition) ---
                    <>
                        {/* Header Section */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <img 
                                    src="/cuk-logo.png"
                                    alt="Central University of Kerala Logo" 
                                    className="rounded-full shadow-md w-20 h-20 object-cover"
                                />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                Central University of Kerala
                            </h1>
                            <p className="text-lg text-gray-200 mt-2">Convocation 2025 Registration</p>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} noValidate>
                            {/* General Error Message Area */}
                            {formMessage && !formMessage.isSuccess && (
                                <div className="mb-4 p-3 rounded-md text-center text-sm font-medium bg-red-500/50 text-white">
                                    {formMessage.text}
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Full Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                                        Full Name
                                    </label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name"
                                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-gray-400"
                                        placeholder="Enter your full name" 
                                        value={name}
                                        // --- THIS IS THE CHANGE ---
                                        onChange={handleNameChange}
                                        required 
                                    />
                                    {nameError && (
                                        <p className="text-red-400 text-xs font-medium mt-1">{nameError}</p>
                                    )}
                                </div>

                                {/* Roll Number Field */}
                                <div>
                                    <label htmlFor="roll-number" className="block text-sm font-medium text-gray-200 mb-1">
                                        Roll Number
                                    </label>
                                    <input 
                                        type="text" 
                                        id="roll-number" 
                                        name="roll-number"
                                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-gray-400"
                                        placeholder="10-digit numeric roll number" 
                                        value={rollNumber}
                                        onChange={handleRollNumberChange}
                                        required 
                                        maxLength={10}
                                        inputMode="numeric"
                                    />
                                    {rollNumberError && (
                                        <p className="text-red-400 text-xs font-medium mt-1">{rollNumberError}</p>
                                    )}
                                </div>

                                {/* Number of Guests Field */}
                                <div>
                                    <label htmlFor="guests" className="block text-sm font-medium text-gray-200 mb-1">
                                        Number of Guests (Max 2)
                                    </label>
                                    <input 
                                        type="number"
                                        id="guests" 
                                        name="guests"
                                        className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-gray-400"
                                        placeholder="0" 
                                        value={guests}
                                        onChange={handleGuestsChange}
                                        required 
                                        maxLength={1}
                                        inputMode="numeric"
                                    />
                                    {guestsError && (
                                        <p className="text-red-400 text-xs font-medium mt-1">{guestsError}</p>
                                    )}
                                </div>
                            </div>

                          {/* Submit Button */}
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className={`
                                        w-full flex justify-center py-3 px-4 border-2 rounded-md shadow-sm text-base font-medium
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                                        transition-all duration-300 ease-in-out
                                        ${isDisabled
                                            // --- DISABLED STYLE ---
                                            ? 'border-gray-600 text-gray-500 cursor-default'
                                            // --- ENABLED STYLE ---
                                            : 'border-white text-white hover:text-white focus:ring-white transform hover:-translate-y-0.5'
                                        }
                                    `}
                                >
                                    {isLoading ? 'Processing...' : 'Register'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegistrationPage;