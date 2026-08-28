import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navegacao from "../../components/Navegacao/Navegacao";
import Rodape from "../../components/Rodape/Rodape";
import { useCarrinho } from "../../context/CarrinhoContext";
import AuthRequests from "../../fetch/AuthRequests";
import { api } from "../../api";
import "./Pagamento.css"; 

function money(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type MetodoPagamento = "pix" | "boleto" | "credito" | "debito";

function PPagamento() {
  const navigate = useNavigate();

  const { itens, total, quantidadeTotal, limpar } = useCarrinho();

  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [finalizando, setFinalizando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");

  async function confirmarPagamento() {
    setMensagem("");
    setFinalizando(true);

    try {
      const idUsuario = AuthRequests.getIdUsuario();

      if (!idUsuario) {
        navigate("/login");
        return;
      }

      if (!itens.length) {
        setMensagem("Seu carrinho está vazio.");
        return;
      }

      // Validação dos dados do cartão
      if (metodo === "credito" || metodo === "debito") {
        if (!numeroCartao || !nomeCartao || !validade || !cvv) {
          setMensagem("Preencha todos os dados do cartão.");
          return;
        }
      }

      // Criação do pedido
      await api.criar("pedidos", {
        idUsuario,
        valorTotal: total,
        status: "PENDENTE",
        formaPagamento: metodo,
      });

      limpar();

      setMensagem("Pagamento realizado com sucesso!");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      setMensagem(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o pagamento."
      );
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <div className="loja-page">
      <Navegacao cartCount={quantidadeTotal} />

      <section className="pagamento-page">

        <h1>Pagamento</h1>

        <div className="pagamento-container">

          {/* MÉTODOS */}
          <div className="pagamento-metodos">

            <h2>Escolha a forma de pagamento</h2>

            <button
              className={`metodo ${metodo === "pix" ? "selecionado" : ""}`}
              onClick={() => setMetodo("pix")}
            >
              <span>💚</span>
              <div>
                <strong>PIX</strong>
                <small>Pagamento instantâneo</small>
              </div>
            </button>

            <button
              className={`metodo ${metodo === "boleto" ? "selecionado" : ""}`}
              onClick={() => setMetodo("boleto")}
            >
              <span>📄</span>
              <div>
                <strong>Boleto</strong>
                <small>Pagamento via boleto bancário</small>
              </div>
            </button>

            <button
              className={`metodo ${metodo === "credito" ? "selecionado" : ""}`}
              onClick={() => setMetodo("credito")}
            >
              <span>💳</span>
              <div>
                <strong>Cartão de crédito</strong>
                <small>Parcele sua compra</small>
              </div>
            </button>

            <button
              className={`metodo ${metodo === "debito" ? "selecionado" : ""}`}
              onClick={() => setMetodo("debito")}
            >
              <span>💳</span>
              <div>
                <strong>Cartão de débito</strong>
                <small>Pagamento à vista</small>
              </div>
            </button>

          </div>

          {/* PAGAMENTO */}
          <div className="pagamento-detalhes">

            {metodo === "pix" && (
              <div className="pagamento-box">
                <h2>Pagamento via PIX</h2>

                <div className="pix-icon">
                  PIX
                </div>

                <p>
                  Após confirmar o pedido, será gerado o código
                  PIX para pagamento.
                </p>

                <strong className="valor-pagamento">
                  {money(total)}
                </strong>
              </div>
            )}

            {metodo === "boleto" && (
              <div className="pagamento-box">
                <h2>Pagamento via boleto</h2>

                <p>
                  O boleto será gerado após a confirmação da compra.
                </p>

                <strong className="valor-pagamento">
                  {money(total)}
                </strong>
              </div>
            )}

            {(metodo === "credito" || metodo === "debito") && (
              <div className="pagamento-box">

                <h2>
                  {metodo === "credito"
                    ? "Cartão de crédito"
                    : "Cartão de débito"}
                </h2>

                <label>Número do cartão</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={numeroCartao}
                  onChange={(e) => setNumeroCartao(e.target.value)}
                />

                <label>Nome no cartão</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nomeCartao}
                  onChange={(e) => setNomeCartao(e.target.value)}
                />

                <div className="cartao-linha">

                  <div>
                    <label>Validade</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={validade}
                      onChange={(e) => setValidade(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>

                </div>

              </div>
            )}

            {/* RESUMO */}
            <div className="pagamento-resumo">

              <h2>Resumo da compra</h2>

              <div className="resumo-linha">
                <span>Produtos</span>
                <span>{quantidadeTotal}</span>
              </div>

              <div className="resumo-linha total">
                <strong>Total</strong>
                <strong>{money(total)}</strong>
              </div>

            </div>

            {mensagem && (
              <div className="toast">
                {mensagem}
              </div>
            )}

            <button
              className="primary pagamento-confirmar"
              onClick={confirmarPagamento}
              disabled={finalizando}
            >
              {finalizando
                ? "Processando..."
                : `Pagar ${money(total)}`}
            </button>

          </div>

        </div>

      </section>

      <Rodape />
    </div>
  );
}

export default PPagamento;