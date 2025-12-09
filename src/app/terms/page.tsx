import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Termos de Serviço
          </h1>
          <p className="text-gray-500 mb-8">Última atualização: Dezembro de 2025</p>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📱</span>
                1. Descrição do Serviço
              </h2>
              <p>
                O <strong>PostUp</strong> é uma plataforma SaaS (Software as a Service) que permite 
                a criação de conteúdos visuais (artes, banners, posts) e o agendamento de publicações 
                automáticas em redes sociais, especificamente Facebook e Instagram. O serviço inclui:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Editor visual para criação de artes e designs</li>
                <li>Conexão com contas do Facebook e Instagram Business</li>
                <li>Agendamento de publicações em horários específicos</li>
                <li>Dashboard de análise de métricas e engajamento</li>
                <li>Gerenciamento de múltiplas páginas e contas sociais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">✅</span>
                2. Aceitação dos Termos
              </h2>
              <p>
                Ao criar uma conta e utilizar o PostUp, você concorda com todos os termos e condições 
                descritos neste documento. Se você não concorda com qualquer parte destes termos, 
                não deve usar o serviço. O uso continuado da plataforma implica na aceitação de 
                eventuais atualizações destes termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">👤</span>
                3. Responsabilidades do Usuário
              </h2>
              <p className="mb-3">Ao usar o PostUp, você concorda em:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Propriedade intelectual:</strong> Possuir todos os direitos sobre o conteúdo publicado (imagens, textos, designs, logotipos)</li>
                <li><strong>Políticas das redes:</strong> Seguir as políticas e diretrizes do Facebook e Instagram</li>
                <li><strong>Conteúdo apropriado:</strong> Não publicar conteúdo ilegal, ofensivo, difamatório, discriminatório ou que viole direitos autorais</li>
                <li><strong>Responsabilidade legal:</strong> Ser inteiramente responsável por todo conteúdo publicado através da plataforma</li>
                <li><strong>Segurança da conta:</strong> Manter suas credenciais de acesso seguras e confidenciais</li>
                <li><strong>Uso adequado:</strong> Não usar o serviço para spam, automação abusiva ou violação de termos de terceiros</li>
                <li><strong>Informações verdadeiras:</strong> Fornecer informações precisas e atualizadas durante o cadastro</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">⚠️</span>
                4. Limitações do Serviço
              </h2>
              <p className="mb-3">O PostUp:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dependência de APIs:</strong> Depende das APIs do Facebook e Instagram, que podem sofrer alterações, instabilidades ou descontinuações sem aviso prévio</li>
                <li><strong>Garantia de publicação:</strong> NÃO garante que todos os posts serão publicados em caso de falhas nas APIs, mudanças de políticas ou problemas técnicos</li>
                <li><strong>Métricas:</strong> NÃO garante resultados específicos de engajamento, alcance ou performance dos posts</li>
                <li><strong>Disponibilidade:</strong> Pode ter períodos de indisponibilidade para manutenção programada ou emergencial</li>
                <li><strong>Limites de uso:</strong> Pode impor limites de quantidade de posts, artes ou contas conectadas conforme o plano contratado</li>
                <li><strong>Compatibilidade:</strong> Funciona apenas com contas Facebook Business e Instagram Business (não contas pessoais)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">🚫</span>
                5. Uso Proibido
              </h2>
              <p className="mb-3">É expressamente proibido:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tentar acessar áreas restritas do sistema ou contas de outros usuários</li>
                <li>Realizar engenharia reversa, descompilar ou modificar o código do PostUp</li>
                <li>Usar o serviço para distribuir malware, vírus ou códigos maliciosos</li>
                <li>Sobrecarregar a infraestrutura com requisições excessivas ou ataques</li>
                <li>Revender ou redistribuir o acesso ao PostUp sem autorização expressa</li>
                <li>Utilizar o serviço para fins ilegais ou fraudulentos</li>
                <li>Coletar dados de outros usuários sem consentimento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">💳</span>
                6. Pagamentos e Planos
              </h2>
              <p className="mb-3">
                O PostUp pode oferecer planos gratuitos e pagos com diferentes funcionalidades. 
                Ao assinar um plano pago:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Você autoriza cobranças recorrentes no método de pagamento cadastrado</li>
                <li>Os valores e funcionalidades dos planos podem ser alterados com aviso prévio de 30 dias</li>
                <li>Não há reembolso proporcional em caso de cancelamento voluntário</li>
                <li>O cancelamento impede renovações futuras mas mantém acesso até o fim do período pago</li>
                <li>Falta de pagamento pode resultar em suspensão ou cancelamento da conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">❌</span>
                7. Cancelamento e Suspensão
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">7.1 Cancelamento pelo Usuário</h3>
                  <p>
                    Você pode cancelar sua conta a qualquer momento através das configurações da plataforma. 
                    Após o cancelamento, seus dados serão deletados em até 30 dias conforme nossa Política de Privacidade.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">7.2 Suspensão pelo PostUp</h3>
                  <p>Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, se:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Você violar estes Termos de Serviço</li>
                    <li>Houver suspeita de atividade fraudulenta ou ilegal</li>
                    <li>Você publicar conteúdo que viole direitos de terceiros</li>
                    <li>Houver falta de pagamento recorrente</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">🛡️</span>
                8. Limitação de Responsabilidade
              </h2>
              <p className="mb-3">
                O PostUp é fornecido <strong>&quot;como está&quot;</strong> e <strong>&quot;conforme disponível&quot;</strong>. 
                Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Perda de dados:</strong> Perda de artes, posts ou dados devido a falhas técnicas, bugs ou problemas de servidor</li>
                <li><strong>Violações de políticas:</strong> Banimentos, restrições ou penalidades aplicadas pelo Facebook/Instagram devido ao conteúdo publicado pelo usuário</li>
                <li><strong>Resultados de marketing:</strong> Performance, engajamento ou resultados comerciais obtidos através das publicações</li>
                <li><strong>Danos indiretos:</strong> Lucros cessantes, perda de oportunidades de negócio ou danos consequenciais</li>
                <li><strong>Ações de terceiros:</strong> Mudanças nas APIs, políticas ou disponibilidade do Facebook/Instagram</li>
                <li><strong>Problemas de conectividade:</strong> Falhas de internet, indisponibilidade de serviços externos ou problemas no dispositivo do usuário</li>
              </ul>
              <p className="mt-3">
                Nossa responsabilidade máxima, em qualquer circunstância, será limitada ao valor pago 
                pelo usuário nos últimos 3 meses de serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">©️</span>
                9. Propriedade Intelectual
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">9.1 Do PostUp</h3>
                  <p>
                    Todo o código, design, marca, logotipos e funcionalidades do PostUp são de nossa 
                    propriedade exclusiva e protegidos por leis de propriedade intelectual.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">9.2 Do Usuário</h3>
                  <p>
                    Você mantém todos os direitos sobre o conteúdo criado no PostUp (artes, textos, imagens). 
                    Ao usar o serviço, você nos concede uma licença limitada para armazenar, processar e 
                    publicar seu conteúdo nas redes sociais conectadas.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">🔄</span>
                10. Modificações dos Termos
              </h2>
              <p>
                Podemos modificar estes Termos de Serviço a qualquer momento. Quando fizermos alterações 
                significativas, notificaremos você por email e exibiremos um aviso destacado no sistema 
                com pelo menos 15 dias de antecedência. O uso continuado do serviço após as mudanças 
                entrarem em vigor constitui sua aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">⚖️</span>
                11. Lei Aplicável e Jurisdição
              </h2>
              <p>
                Estes Termos de Serviço são regidos pelas leis da República Federativa do Brasil. 
                Quaisquer disputas ou controvérsias decorrentes destes termos serão resolvidas 
                exclusivamente nos tribunais brasileiros, renunciando as partes a qualquer outro 
                foro, por mais privilegiado que seja.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📞</span>
                12. Contato e Suporte
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="mb-2">
                  Para dúvidas, suporte técnico ou questões sobre estes termos:
                </p>
                <ul className="space-y-2">
                  <li><strong>Email:</strong> contato@postup.com.br</li>
                  <li><strong>Suporte:</strong> suporte@postup.com.br</li>
                  <li><strong>Termos:</strong> legal@postup.com.br</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  Nosso horário de atendimento é de segunda a sexta, das 9h às 18h (horário de Brasília).
                </p>
              </div>
            </section>

            <section className="border-t pt-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📋</span>
                13. Disposições Gerais
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Se qualquer cláusula destes termos for considerada inválida, as demais permanecem em vigor</li>
                <li>O não exercício de qualquer direito não constitui renúncia</li>
                <li>Estes termos constituem o acordo completo entre você e o PostUp</li>
                <li>Você não pode transferir seus direitos ou obrigações sem nosso consentimento</li>
                <li>Podemos transferir nossos direitos e obrigações a terceiros mediante notificação</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-6 border-t text-center">
            <p className="text-sm text-gray-500 mb-4">
              Ao continuar usando o PostUp, você confirma que leu, compreendeu e concorda com estes Termos de Serviço.
            </p>
            <p className="text-sm text-gray-500">
              © 2025 PostUp. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
