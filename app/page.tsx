import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 font-sans">
      <div className="flex item-center w-full justify-center h-screen flex-col text-center gap-8">
        <h1 className="text-5xl text-gray-100">University Health Services – Your Wellbeing Matters</h1>
        <p className="text-xl text-gray-100">Access mental health support, urgent care, and wellness resources directly from campus. Simple, confidential, and 100% free for students.</p>
        <button className="text-white text-2xl bg-blue-500 w-max mx-auto p-2 rounded-lg">Book Appointment</button>
      </div>
    </main>
  );
}
