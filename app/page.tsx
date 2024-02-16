import App from './App';
import Chat from './Chat';

export const metadata = {
  title: 'Bug Wizard',
};

export default function Home() {
  return (
    <main>
      <App>
        <Chat />
      </App>
    </main>
  );
}
