import DashboardLayout from '../components/DashboardLayout';
import { Filter } from '../components/Filter';
import RepositoryFilter from '../components/RepositoryFilter';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { useEffect, useMemo, useState } from 'react';
/**
 * Timeline Component
 *
 * Overview timeline page displaying repository activities.
 */
export default function Timeline() {
  const [selectedTime, setSelectedTime] = useState<string>('Last 7 days');
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const calendarRows = 10; // Número de linhas independente de 7 dias ou 12 meses
    
  // Carregar dados do JSON
  useEffect(() => {
    const loadData = async () => {
      try {
        const fileName = selectedTime === 'Last 7 days' ? 'timeline_last_7_days.json' : 'timeline_last_12_months.json';
        const response = await fetch(`/data/gold/${fileName}`);
        const data = await response.json();
        // Filtrar out a metadata
        const filteredData = data.filter((item: any) => !item._metadata);
        console.log('Dados carregados:', filteredData);
        console.log('Primeiro item:', filteredData[0]);
        console.log('Autores do primeiro dia:', filteredData[0]?.authors);
        setTimelineData(filteredData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setTimelineData([]);
      }
    };
    loadData();
  }, [selectedTime]);
    
  const handleTimeChange = (selected: string) => {
    setSelectedTime(selected);
  };

  return (
    <DashboardLayout currentPage="overview" currentSubPage="timeline">
      <div className="w-full min-h-screen -mx-8 -my-8 px-8 py-8">
        <div className="space-y-4 mt-30">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Timeline</h1>
            <p className="text-slate-400">
              Timeline of the repository events that happend during the past week
            </p>
          </div>
          {/* Charts Grid */}
          <div className="w-full">
            <div
              className="border rounded-lg h-170 w-full overflow-hidden flex flex-col"
              style={{ backgroundColor: '#222222', borderColor: '#333333' }}
            >
              <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
                <h4 className="text-lg font-semibold text-white mb-3">Filters</h4>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 px-6 ">
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
              

              <div className="px-6 py-4 border-t" style={{ borderTopColor: '#333333' }}>
                <h3 className="text-xl font-bold text-white">Timeline Analysis</h3>
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
                <div style={{ display: 'inline-block', minWidth: 'fit-content' }}>
                  <CalendarHeatmap
                    data={timelineData}
                    mode={selectedTime === 'Last 7 days' ? 'weekly' : 'monthly'}
                    rows={calendarRows}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
