export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
      <div className="container mx-auto px-4">
        <p>
          Developed by{" "}
          <a
            href="https://github.com/Fhanafii"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            Fahmi Hanafi
          </a>{" "}
          &{" "}
          <a
            href="https://github.com/raffiMRG"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            M.Raffi Gumilang
          </a>
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} LMS SD Negeri 8 Metro Pusat
        </p>
      </div>
    </footer>
  )
}
