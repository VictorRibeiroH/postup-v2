export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-gray-500 mb-8">Última atualização: Dezembro de 2025</p>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📋</span>
                1. Dados Coletados
              </h2>
              <p className="mb-3">Coletamos as seguintes informações quando você usa o PostUp:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de cadastro:</strong> Nome completo e email fornecidos no registro</li>
                <li><strong>Informações do Facebook:</strong> Nome da página, ID, foto de perfil, número de seguidores</li>
                <li><strong>Informações do Instagram:</strong> Nome da conta Business, username, foto, seguidores</li>
                <li><strong>Conteúdo criado:</strong> Artes, imagens, textos e designs criados no editor</li>
                <li><strong>Histórico de publicações:</strong> Posts agendados e publicados nas redes sociais</li>
                <li><strong>Métricas:</strong> Dados de engajamento dos posts (curtidas, comentários, alcance)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🎯</span>
                2. Como Usamos os Dados
              </h2>
              <p className="mb-3">Utilizamos suas informações exclusivamente para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publicar automaticamente posts nas suas páginas e contas conectadas</li>
                <li>Exibir métricas de engajamento (curtidas, comentários, alcance, compartilhamentos)</li>
                <li>Armazenar e gerenciar seu histórico de publicações</li>
                <li>Melhorar a experiência do usuário e funcionalidades da plataforma</li>
                <li>Enviar notificações sobre posts agendados e publicados</li>
                <li>Fornecer suporte técnico quando solicitado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🔒</span>
                3. Armazenamento e Segurança
              </h2>
              <p className="mb-3">Seus dados são armazenados de forma segura com as seguintes medidas:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Banco de dados:</strong> Supabase (PostgreSQL) com criptografia</li>
                <li><strong>Transmissão:</strong> Todas as comunicações usam HTTPS/TLS</li>
                <li><strong>Autenticação:</strong> Row Level Security (RLS) - cada usuário acessa apenas seus dados</li>
                <li><strong>Tokens de acesso:</strong> Armazenados de forma criptografada</li>
                <li><strong>Backups:</strong> Realizados automaticamente todos os dias</li>
                <li><strong>Servidores:</strong> Localizados em datacenters certificados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">👤</span>
                4. Seus Direitos
              </h2>
              <p className="mb-3">Você tem total controle sobre seus dados e pode a qualquer momento:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Desconectar contas:</strong> Remover a conexão com Facebook e Instagram</li>
                <li><strong>Deletar conta:</strong> Remover permanentemente sua conta e todos os dados associados</li>
                <li><strong>Exportar dados:</strong> Solicitar cópia dos seus dados via email</li>
                <li><strong>Revogar permissões:</strong> Remover acesso do PostUp nas configurações do Facebook/Instagram</li>
                <li><strong>Atualizar informações:</strong> Modificar seus dados cadastrais a qualquer momento</li>
                <li><strong>Solicitar correções:</strong> Pedir correção de informações incorretas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">⏰</span>
                5. Retenção de Dados
              </h2>
              <p>
                Mantemos seus dados enquanto sua conta estiver ativa e você estiver usando o serviço. 
                Após você solicitar a exclusão da conta, todos os seus dados pessoais, artes criadas, 
                posts agendados e métricas serão permanentemente removidos de nossos servidores em até 
                <strong> 30 dias</strong>.
              </p>
              <p className="mt-3">
                Alguns dados podem ser retidos por períodos maiores quando exigido por lei ou para 
                fins de auditoria e segurança.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🤝</span>
                6. Compartilhamento de Dados
              </h2>
              <p className="mb-3">
                <strong>NÃO vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros</strong>, 
                exceto nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Meta (Facebook/Instagram):</strong> Para publicar posts nas suas contas conectadas</li>
                <li><strong>Obrigação legal:</strong> Quando exigido por ordem judicial ou autoridade competente</li>
                <li><strong>Proteção de direitos:</strong> Para proteger nossos direitos legais ou prevenir fraudes</li>
              </ul>
              <p className="mt-3">
                Todos os parceiros e fornecedores seguem rigorosos padrões de segurança e privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🍪</span>
                7. Cookies e Tecnologias
              </h2>
              <p className="mb-3">Utilizamos cookies essenciais para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Manter sua sessão de login ativa</li>
                <li>Lembrar suas preferências de interface</li>
                <li>Garantir a segurança da sua conta</li>
              </ul>
              <p className="mt-3">
                Você pode gerenciar cookies nas configurações do seu navegador, mas isso pode afetar 
                algumas funcionalidades do PostUp.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">👶</span>
                8. Menores de Idade
              </h2>
              <p>
                O PostUp não é destinado a menores de 18 anos. Não coletamos intencionalmente 
                informações de crianças ou adolescentes. Se você é pai/mãe e acredita que seu 
                filho forneceu dados pessoais, entre em contato conosco para remoção imediata.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🔄</span>
                9. Alterações na Política
              </h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças 
                em nossas práticas ou por razões legais. Quando fizermos alterações significativas, 
                notificaremos você por email e exibiremos um aviso destacado no sistema. A data da 
                última atualização será sempre indicada no topo desta página.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📧</span>
                10. Contato
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <p className="mb-2">
                  Para dúvidas, solicitações ou preocupações sobre privacidade, entre em contato:
                </p>
                <ul className="space-y-2">
                  <li><strong>Email:</strong> privacidade@postup.com.br</li>
                  <li><strong>Suporte:</strong> contato@postup.com.br</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  Responderemos todas as solicitações em até 5 dias úteis.
                </p>
              </div>
            </section>

            <section className="border-t pt-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">⚖️</span>
                11. Legislação Aplicável
              </h2>
              <p>
                Esta Política de Privacidade é regida pelas leis brasileiras, incluindo a 
                Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Quaisquer disputas 
                relacionadas a esta política serão resolvidas nos tribunais brasileiros.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
            <p>© 2025 PostUp. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
