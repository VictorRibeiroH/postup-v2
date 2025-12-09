export default function Footer() {
  return (
    <footer id="contato" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold">
            Post<span className="text-[#FF6400]">Up</span>
          </h2>
        </div>

        {/* Links or additional info can go here */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-gray-400">
          <a href="#funcionalidades" className="hover:text-[#FF6400] transition-colors">
            Funcionalidades
          </a>
          <a href="#planos" className="hover:text-[#FF6400] transition-colors">
            Planos
          </a>
          <a href="#contato" className="hover:text-[#FF6400] transition-colors">
            Contato
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-6"></div>

        {/* Copyright */}
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} PostUp - Todos os direitos reservados
        </p>
        <p className="text-gray-500 text-sm mt-2">
          FM Marketing
        </p>
      </div>
    </footer>
  );
}
