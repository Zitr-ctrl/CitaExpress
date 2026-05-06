import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mi Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu información personal
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-8">
          <div className="flex items-center mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 mt-1">
                {user.role === 'Client' ? 'Cliente' : user.role}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nombre completo
              </label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Correo electrónico
              </label>
              <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Teléfono
              </label>
              <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {user.phone || 'No registrado'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Fecha de registro
              </label>
              <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(user.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}