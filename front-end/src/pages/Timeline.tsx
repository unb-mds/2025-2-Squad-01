import DashboardLayout from '../components/DashboardLayout';
import { Filter } from '../components/Filter';
import RepositoryFilter from '../components/RepositoryFilter';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TimelineExtraction, TimelineData } from './TimelineExtraction';

/**
 * Timeline Component
 *
 * Overview timeline page displaying repository activities.
 */

interface UserActivityData {
  name: string;
  repositories?: string[];
  activities: {
    commits: number;
    issues_created: number;
    issues_closed: number;
    prs_created: number;
    prs_closed: number;
    comments: number;
  };
  dailyValues: number[];
  dailyDetails: Array<{
    commits: number;
    issues_created: number;
    issues_closed: number;
    prs_created: number;
    prs_closed: number;
    comments: number;
  }>;
}

// Função para transformar TimelineData[] (agrupado por data) em UserActivityData[] (agrupado por usuário)
function transformToUserActivity(timelineData: TimelineData[]): UserActivityData[] {
  const userMap = new Map<string, UserActivityData>();

  // Iterar sobre cada data
  timelineData.forEach((dateEntry) => {
    // Iterar sobre cada usuário na data
    dateEntry.users.forEach((user) => {
      const userName = user.name || 'Unknown';
      
      if (!userMap.has(userName)) {
        // Criar entrada para novo usuário
        userMap.set(userName, {
          name: userName,
          repositories: user.repositories ? [...user.repositories] : [],
          activities: {
            commits: 0,
            issues_created: 0,
            issues_closed: 0,
            prs_created: 0,
            prs_closed: 0,
            comments: 0,
          },
          dailyValues: new Array(timelineData.length).fill(0),
          dailyDetails: new Array(timelineData.length).fill(null).map(() => ({
            commits: 0,
            issues_created: 0,
            issues_closed: 0,
            prs_created: 0,
            prs_closed: 0,
            comments: 0,
          })),
        });
      }

      const userData = userMap.get(userName)!;
      const dateIndex = timelineData.findIndex(d => d.date === dateEntry.date);

      // Somar atividades totais do usuário
      userData.activities.commits += user.activities.commits;
      userData.activities.issues_created += user.activities.issues_created;
      userData.activities.issues_closed += user.activities.issues_closed;
      userData.activities.prs_created += user.activities.prs_created;
      userData.activities.prs_closed += user.activities.prs_closed;
      userData.activities.comments += user.activities.comments;

      // Armazenar detalhes do dia
      userData.dailyDetails[dateIndex].commits += user.activities.commits;
      userData.dailyDetails[dateIndex].issues_created += user.activities.issues_created;
      userData.dailyDetails[dateIndex].issues_closed += user.activities.issues_closed;
      userData.dailyDetails[dateIndex].prs_created += user.activities.prs_created;
      userData.dailyDetails[dateIndex].prs_closed += user.activities.prs_closed;
      userData.dailyDetails[dateIndex].comments += user.activities.comments;

      // Calcular total de atividades para este dia
      const dailyTotal =
        user.activities.commits +
        user.activities.issues_created +
        user.activities.issues_closed +
        user.activities.prs_created +
        user.activities.prs_closed +
        user.activities.comments;

      userData.dailyValues[dateIndex] = dailyTotal;

      // Adicionar repositórios únicos
      if (user.repositories) {
        user.repositories.forEach((repo) => {
          if (!userData.repositories?.includes(repo)) {
            userData.repositories?.push(repo);
          }
        });
      }
    });
  });

  return Array.from(userMap.values());
}

export default function Timeline() {
  const [selectedTime, setSelectedTime] = useState<string>('Last 7 days');
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<UserActivityData[]>([]);
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedRepo = searchParams.get('repo');
    
  const handleTimeChange = (selected: string) => {
    setSelectedTime(selected);
  };

  // Buscar dados quando filtros mudarem
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const timeFilter = selectedTime === 'Last 7 days' ? 'last_7_days' : 'last_12_months';
        const repoFilter = selectedRepo || undefined;
        
        console.log('Fetching timeline data...', { timeFilter, repoFilter });
        
        const timelineData = await TimelineExtraction.extractTimelineData(timeFilter, repoFilter);
        console.log('Timeline data received:', timelineData);
        console.log('Number of dates:', timelineData.length);
        
        // Garantir que sempre temos o número correto de dias/meses
        const expectedLength = selectedTime === 'Last 7 days' ? 7 : 12;
        
        // Se temos dados, preencher os dias faltantes
        let completeTimelineData = [...timelineData];
        
        if (timelineData.length > 0 && timelineData.length < expectedLength) {
          // Obter a primeira e última data
          const firstDate = new Date(timelineData[0].date + 'T00:00:00');
          const lastDate = new Date(timelineData[timelineData.length - 1].date + 'T00:00:00');
          
          // Criar array com todas as datas esperadas
          const allDates: TimelineData[] = [];
          
          if (selectedTime === 'Last 7 days') {
            // Para 7 dias, preencher do primeiro ao último + dias faltantes
            const startDate = new Date(firstDate);
            for (let i = 0; i < expectedLength; i++) {
              const currentDate = new Date(startDate);
              currentDate.setDate(startDate.getDate() + i);
              const dateStr = currentDate.toISOString().split('T')[0];
              
              // Verificar se já existe no timelineData
              const existingData = timelineData.find(d => d.date === dateStr);
              if (existingData) {
                allDates.push(existingData);
              } else {
                // Adicionar dia vazio
                allDates.push({
                  date: dateStr,
                  users: []
                });
              }
            }
          } else {
            // Para 12 meses, fazer o mesmo
            const startDate = new Date(firstDate);
            for (let i = 0; i < expectedLength; i++) {
              const currentDate = new Date(startDate);
              currentDate.setMonth(startDate.getMonth() + i);
              const dateStr = currentDate.toISOString().split('T')[0];
              
              const existingData = timelineData.find(d => d.date === dateStr);
              if (existingData) {
                allDates.push(existingData);
              } else {
                allDates.push({
                  date: dateStr,
                  users: []
                });
              }
            }
          }
          
          completeTimelineData = allDates;
        }
        
        // Extrair as datas reais do JSON
        const dates = completeTimelineData.map(d => d.date);
        console.log('Dates:', dates);
        
        // Formatar as datas para exibição
        const formattedDates = dates.map(dateStr => {
          const date = new Date(dateStr + 'T00:00:00');
          
          if (selectedTime === 'Last 7 days') {
            // Formato: "Nov 11 (Mon)"
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `${monthDay} (${dayName})`;
          } else {
            // Formato para 12 meses: "Nov 11 (November)" ou apenas mês se necessário
            const monthName = date.toLocaleDateString('en-US', { month: 'long' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `${monthDay} (${monthName})`;
          }
        });
        console.log('Formatted dates:', formattedDates);
        
        setDateLabels(formattedDates);
        
        const transformedData = transformToUserActivity(completeTimelineData);
        console.log('Transformed user data:', transformedData);
        console.log('Number of users:', transformedData.length);
        
        setUserData(transformedData);
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        setUserData([]);
        setDateLabels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedTime, selectedRepo]);

  return (
    <DashboardLayout currentPage="overview" currentSubPage="timeline">
      <div className="w-full h-full -mx-8 -my-8 px-8 py-8">
        <div className="space-y-4 mt-30">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Timeline</h1>
            <p className="text-slate-400">
              Timeline of the repository events that happened during the past week or year.
            </p>
          </div>
          {/* Charts Grid */}
          <div className="w-[1655px]">
            <div
              className="border rounded-lg h-170 w-full overflow-hidden flex flex-col"
              style={{ backgroundColor: '#222222', borderColor: '#333333' }}
            >
              <div className="px-3 pt-3 " style={{ borderBottomColor: '#333333' }}>
                <h4 className="text-lg font-semibold text-white ">Filters:</h4>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 px-3 mb-2">
                {/* Timeline Filter */}
                <Filter
                  title="Date Range"
                  content={[
                    'Last 7 days',
                    'Last 12 months',
                  ]}
                  value={selectedTime}
                  sendSelectedValue={handleTimeChange}
                />
                {/* Repository Filter */}
                <RepositoryFilter />
              </div>
              

              <div className="px-3 py-3 border-t" style={{ borderTopColor: '#333333' }}>
                <h3 className="text-xl font-bold text-white">Timeline Analysis:</h3>
              </div>

              <div 
                style={{ 
                  backgroundColor: '#1a1a1a', 
                  overflowX: 'auto',
                  overflowY: 'auto',
                  flex: 1,
                  padding: '16px'
                }}
              >
                {isLoading ? (
                  <div className="text-center text-slate-400 py-8">Loading data...</div>
                ) : userData.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">No data available</div>
                ) : (
                  <div style={{ display: 'inline-block', minWidth: 'fit-content' }}>
                    <CalendarHeatmap
                      userData={userData}
                      mode={selectedTime === 'Last 7 days' ? 'weekly' : 'monthly'}
                      dateLabels={dateLabels}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
