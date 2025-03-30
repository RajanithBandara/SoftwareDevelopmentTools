
import DesktopMapView from "../Pages/DesktopMap";
import AppHeader from "../Pages/DashComponents/Header.tsx";
import AppFooter from "../Pages/DashComponents/Footer.tsx";

function HomePage() {
  return (
      <>
          <AppHeader />
          
              <DesktopMapView />
          
          <AppFooter />
          
          
      </>
  );
}

export default HomePage;
