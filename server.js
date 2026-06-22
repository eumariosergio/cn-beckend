const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const SERP_KEY = process.env.SERP_KEY || '30ddeef1a9801f630563b1e8f29d627960717b38624b4f3f1afa0f785cf20c8c';

app.use(cors());
app.use(express.json());

app.get('/voos', async (req, res) => {
  const { origem, destino, data } = req.query;
  
  if (!origem || !destino || !data) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: origem, destino, data' });
  }

  try {
    const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${origem}&arrival_id=${destino}&outbound_date=${data}&currency=BRL&hl=pt&adults=2&type=2&api_key=${SERP_KEY}`;
    
    const r = await fetch(url);
    const data_json = await r.json();
    
    const flights = data_json.best_flights || data_json.other_flights || [];
    
    const result = flights.slice(0, 3).map(f => ({
      duracao_total: f.total_duration,
      trechos: (f.flights || []).map(leg => ({
        companhia: leg.airline,
        numero: leg.flight_number,
        origem: leg.departure_airport?.id,
        destino: leg.arrival_airport?.id,
        saida: leg.departure_airport?.time,
        chegada: leg.arrival_airport?.time,
        duracao: leg.duration
      }))
    }));

    res.json({ voos: result });
    
  } catch(e) {
    res.status(500).json({ error: 'Erro ao buscar voos', detail: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
