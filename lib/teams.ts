export const TOP_LEAGUE_TEAMS: Record<string, string[]> = {
  England: [
    'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Burnley',
    'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Liverpool', 'Manchester City',
    'Manchester United', 'Newcastle United', 'Nottingham Forest', 'Sunderland',
    'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers', 'Leeds United',
  ],
  Spain: [
    'Alaves', 'Athletic Club', 'Atletico Madrid', 'Barcelona', 'Celta Vigo', 'Espanyol',
    'Getafe', 'Girona', 'Las Palmas', 'Leganes', 'Mallorca', 'Osasuna',
    'Rayo Vallecano', 'Real Betis', 'Real Madrid', 'Real Sociedad', 'Sevilla', 'Valencia',
    'Valladolid', 'Villarreal',
  ],
  Italy: [
    'AC Milan', 'Atalanta', 'Bologna', 'Cagliari', 'Como', 'Empoli', 'Fiorentina',
    'Genoa', 'Hellas Verona', 'Inter Milan', 'Juventus', 'Lazio', 'Lecce',
    'Monza', 'Napoli', 'Parma', 'Roma', 'Torino', 'Udinese', 'Venezia',
  ],
  France: [
    'Angers', 'Auxerre', 'Brest', 'Le Havre', 'Lens', 'Lille', 'Lyon', 'Marseille',
    'Metz', 'Monaco', 'Montpellier', 'Nantes', 'Nice', 'Paris Saint-Germain',
    'Reims', 'Rennes', 'Saint-Etienne', 'Strasbourg', 'Toulouse',
  ],
  Germany: [
    'Augsburg', 'Bayer Leverkusen', 'Bayern Munich', 'Bochum', 'Borussia Dortmund',
    'Borussia Monchengladbach', 'Eintracht Frankfurt', 'Freiburg', 'Heidenheim',
    'Hoffenheim', 'Holstein Kiel', 'Mainz 05', 'RB Leipzig', 'St Pauli', 'Stuttgart',
    'Union Berlin', 'Werder Bremen', 'Wolfsburg',
  ],
  Netherlands: [
    'Ajax', 'AZ Alkmaar', 'Feyenoord', 'PSV Eindhoven', 'Twente', 'Utrecht', 'Heerenveen',
    'Sparta Rotterdam', 'NEC Nijmegen', 'Go Ahead Eagles', 'RKC Waalwijk', 'PEC Zwolle',
    'Fortuna Sittard', 'Heracles Almelo', 'Groningen', 'NAC Breda', 'Willem II', 'Almere City',
  ],
  Portugal: [
    'Benfica', 'Porto', 'Sporting CP', 'Braga', 'Vitoria SC', 'Boavista', 'Famalicao',
    'Casa Pia', 'Estoril', 'Farense', 'Arouca', 'Rio Ave', 'Nacional', 'Moreirense',
    'Gil Vicente', 'Santa Clara', 'AVS', 'Estrela Amadora',
  ],
  Turkey: [
    'Adana Demirspor', 'Alanyaspor', 'Antalyaspor', 'Basaksehir', 'Besiktas', 'Bodrum FK',
    'Caykur Rizespor', 'Eyupspor', 'Fenerbahce', 'Galatasaray', 'Gaziantep FK',
    'Goztepe', 'Hatayspor', 'Kasimpasa', 'Kayserispor', 'Konyaspor', 'Samsunspor',
    'Sivasspor', 'Trabzonspor',
  ],
};

export const TOP_LEAGUES = Object.keys(TOP_LEAGUE_TEAMS);

export function getTeamsForLeague(league: string): string[] {
  return TOP_LEAGUE_TEAMS[league] ?? [];
}
