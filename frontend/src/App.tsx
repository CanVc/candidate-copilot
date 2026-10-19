import { useEffect, useState } from 'react';
import { checkHealth } from './health';

type Availability = 'checking' | 'available' | 'unavailable';
const labels: Record<Availability, string> = {
  checking: 'Vérification du Worker…',
  available: 'Worker disponible.',
  unavailable: 'Worker indisponible. Rechargez la page pour réessayer.',
};

export default function App() {
  const [availability, setAvailability] = useState<Availability>('checking');

  useEffect(() => {
    const controller = new AbortController();
    void checkHealth(controller.signal).then((available) => {
      if (!controller.signal.aborted) setAvailability(available ? 'available' : 'unavailable');
    });
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>Socle technique local</h1>
      <p role="status">{labels[availability]}</p>
      <p>La disponibilité technique ne signifie pas que le produit est prêt.</p>
      <p>Aucune conversation, recherche documentaire ni connexion à un modèle réel.</p>
    </main>
  );
}
