import './Home.css';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import sensorImg from '../../assets/sensor.png';
import analiseImg from '../../assets/analise.png';
import plataformaImg from '../../assets/plataforma.png';

function Home() {
  return (
    <div className="Home">
      <Header />
      <main className="Main">
        <div className="Intro">
          <h2>
            <span className="IntroLine1"><strong>Transformando</strong> Cidades</span>
          </h2>
          <h3>
            <span className="IntroLine2">Com <strong>Tecnologia</strong> Inteligente</span>
          </h3>
        </div>

        {/* Retângulo preto ocupando a largura da tela */}
        <div className="BlackBar">
          <div className="FeaturesContainer">
            {/* Cada feature tem agora um círculo gradiente por trás */}
            <div className="Feature">
              <div className="CircleGradient"></div>
              <img src={sensorImg} alt="Sensor" className="CircleIcon" />
              <p>
                <span className="Feat1Line1">Monitoramento em</span><br />
                <span className="Feat1Line2"><strong>Tempo Real de Sensores</strong></span>
              </p>
            </div>
            <div className="Feature">
              <div className="CircleGradient"></div>
              <img src={analiseImg} alt="Análise de Dados" className="CircleIcon" />
              <p>
                <span className="Feat2Line1"><strong>Análise de Dados</strong></span><br />
                <span className="Feat2Line2">para Decisões Públicas</span>
              </p>
            </div>
            <div className="Feature">
              <div className="CircleGradient"></div>
              <img src={plataformaImg} alt="Plataforma Acessível" className="CircleIcon" />
              <p>
                <span className="Feat3Line1">Plataforma Acessível</span><br />
                <span className="Feat3Line2"><strong>de Qualquer Lugar</strong></span>
              </p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

export default Home;
