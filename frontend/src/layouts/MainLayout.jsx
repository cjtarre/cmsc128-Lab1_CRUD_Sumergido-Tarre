import { Outlet } from 'react-router-dom';
import NavBar from '../components/navigation/NavBar';
import Header from '../components/header/Header';

function MainLayout() {
    return (
        <>
            <NavBar />

            <div>
                <Header />
                <main>
                    <Outlet />
                </main>
            </div>
            
        </>
    );
}

export default MainLayout;