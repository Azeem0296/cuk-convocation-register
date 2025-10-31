// app/form/page.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type FormMessage = { text: string; isSuccess: boolean } | null;

const RegistrationPage: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [rollNumber, setRollNumber] = useState<string>('');

  const [guests, setGuests] = useState<number | null>(null);
  const [guestsError, setGuestsError] = useState<string>('');

  // guardian fields
  const [guardian1, setGuardian1] = useState<string>('');
  const [guardian2, setGuardian2] = useState<string>('');

  const [formMessage, setFormMessage] = useState<FormMessage>(null);
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [isFetchingProfile, setIsFetchingProfile] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false);

  const router = useRouter();

  // Fetch profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getSession();
      const session = (data as any)?.session;
      if (!session) return router.push('/');

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-student-info-by-auth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const profile = await res.json();
        if (!res.ok) throw new Error(profile?.error || 'Failed to fetch profile');

        setFullName(profile?.name ?? '');
        setEmail(profile?.email ?? '');
        setRollNumber(profile?.roll_no ?? '');
        setDepartment(profile?.dept ?? '');

        if (profile?.is_registered) {
          setIsAlreadyRegistered(true);
          setGuests(profile?.guest_count ?? 0);
          setGuardian1(profile?.guardian1 ?? '');
          setGuardian2(profile?.guardian2 ?? '');
          setFormMessage({ text: 'Registration Data Loaded', isSuccess: true });
        } else {
          setGuests(null);
        }
      } catch (err: any) {
        await supabase.auth.signOut();
        router.push(`/?error=${encodeURIComponent(err?.message ?? 'Unknown error')}`);
      } finally {
        setIsFetchingProfile(false);
      }
    };

    loadProfile();
  }, [router]);

  // Guest handler + clear guardian fields as needed
  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAlreadyRegistered) return;

    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);

    if (raw === '') {
      setGuests(null);
      setGuestsError('');
      setGuardian1('');
      setGuardian2('');
      return;
    }

    const count = parseInt(raw, 10);

    if (isNaN(count) || count < 0 || count > 2) {
      setGuests(null);
      setGuestsError('Number of guests must be between 0 and 2.');
      setGuardian1('');
      setGuardian2('');
      return;
    }

    setGuests(count);
    setGuestsError('');

    if (count === 0) {
      setGuardian1('');
      setGuardian2('');
    } else if (count === 1) {
      setGuardian2('');
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadyRegistered || isFetchingProfile || isSubmitting) return;

    if (guests === null || guests < 0 || guests > 2) {
      setGuestsError('Number of guests must be between 0 and 2.');
      return;
    }

    const { data } = await supabase.auth.getSession();
    const session = (data as any)?.session;
    if (!session) return router.push('/');

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-student-by-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            guest_count: guests,
            guest_1_name: guardian1 || null,
            guest_2_name: guardian2 || null,
          }),
        }
      );

      if (res.ok) {
        router.push('/your-ticket');
      } else {
        const data = await res.json().catch(() => null);
        setFormMessage({ text: data?.error || 'Registration failed.', isSuccess: false });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // typed profile fields array
  const profileFields: { label: string; value: string }[] = [
    { label: 'Full Name', value: fullName },
    { label: 'Department', value: department },
    { label: 'Email', value: email },
    { label: 'Roll Number', value: rollNumber },
  ];

  const isFormValid =
    guests !== null &&
    guests >= 0 &&
    guests <= 2 &&
    fullName.trim() !== '' &&
    email.trim() !== '' &&
    rollNumber.trim() !== '' &&
    department.trim() !== '';

  const disableBtn = isFetchingProfile || isSubmitting || !isFormValid || isAlreadyRegistered;

  return (
    <div
      className="relative flex items-center justify-center min-h-screen p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/college-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-lg p-6 sm:p-10 bg-black/30 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <img src="/cuk-logo.png" alt="CUK" className="mx-auto mb-4 w-20 h-20 rounded-full" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Central University of Kerala</h1>
          <p className="text-gray-200 mt-2">Convocation 2025 Registration</p>
        </div>

        <form onSubmit={handleSubmit}>
          {infoMessage && (
            <div className="mb-4 p-3 rounded bg-green-500/60 text-white text-center">{infoMessage}</div>
          )}

          {formMessage && !formMessage.isSuccess && (
            <div className="mb-4 p-3 rounded bg-red-500/60 text-white text-center">
              {formMessage.text}
            </div>
          )}

          {isFetchingProfile && <p className="text-center text-gray-200">Loading...</p>}

          {!isFetchingProfile && (
            <div className="space-y-5">
              {profileFields.map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-sm text-gray-200 mb-1">{label}</label>
                  <input
                    value={String(value)}
                    readOnly
                    disabled
                    className="w-full px-4 py-2 bg-gray-800 text-gray-400 border border-gray-600 rounded cursor-not-allowed"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-200 mb-1">Number of Guests (Max 2)</label>
                <input
                  type="number"
                  value={guests ?? ''}
                  onChange={handleGuestsChange}
                  disabled={isAlreadyRegistered}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                  placeholder="0"
                />
                {guestsError && <p className="text-red-400 text-xs mt-1">{guestsError}</p>}
              </div>

              {/* Guardian fields conditionally shown */}
              {guests === 1 && (
                <div>
                  <label className="block text-sm text-gray-200 mb-1">Guardian Name 1</label>
                  <input
                    type="text"
                    value={guardian1}
                    onChange={(e) => setGuardian1(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                    placeholder="Enter Guardian Name"
                  />
                </div>
              )}

              {guests === 2 && (
                <>
                  <div>
                    <label className="block text-sm text-gray-200 mb-1">Guardian Name 1</label>
                    <input
                      type="text"
                      value={guardian1}
                      onChange={(e) => setGuardian1(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                      placeholder="Enter Guardian Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-200 mb-1">Guardian Name 2</label>
                    <input
                      type="text"
                      value={guardian2}
                      onChange={(e) => setGuardian2(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                      placeholder="Enter Guardian Name"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {!isFetchingProfile && !isAlreadyRegistered && (
            <button
              type="submit"
              className="w-full mt-6 py-3 rounded text-white font-medium bg-blue-600 hover:bg-blue-700"
              >
              {isSubmitting ? 'Processing...' : 'Register'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
