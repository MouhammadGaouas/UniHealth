export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
            <h1 className="text-4xl font-bold mb-4 text-red-500">401 - Unauthorized</h1>
            <p className="text-gray-400 mb-8">You do not have permission to access this page.</p>
            <a href="/" className="px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-500 transition">
                Go Home
            </a>
        </div>
    );
}
