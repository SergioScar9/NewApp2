import BasicExample from "./cardHome";
import Home from "./Home";

const HomePage = () => {
  return (
    <>
      <Home />
      <div className="d-flex flex-column flex-md-row justify-content-center align-items-stretch gap-4">
        <BasicExample
          title="Scegli la categoria"
          description="Questo è il primo passo per capire la vostra compatibilità, scegli la tua categoria preferita"
          imgSrc="./assets/Img/es.categorie2"
        />
        <BasicExample
          title="SKIP o WATCH"
          description="Scegli se passare il film visualizzato o mettere un WATCH,se anche qualcun'altro come te ha fatto click su WATCH, farete un match e saprete subito che film o serie guardare"
          imgSrc="./assets/Img/es.card1.png"
        />

        <BasicExample
          title="WATCH"
          description="Ora che avete fatto WATCH-MATCH, godetevi il vostro film o serie TV insieme."
          imgSrc="./assets/Img/watch1.png"
        />
      </div>
    </>
  );
};
export default HomePage;
