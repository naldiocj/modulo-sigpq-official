const pathFiles="../../src"
const eventosFuncionario='../../src/funcionario/eventos/funcionario-eventos.ts'
const eventosDashboard='../../src/dashboard/eventos/dashboard-eventos.ts'
const eventosDashboard_Novo='../../src/dashboard/eventos/dashboard-novo-eventos.ts'
async function importarEventoFuncionario(filePath:string) {
try {await import(filePath);} catch (error) {}}importarEventoFuncionario(eventosFuncionario);

async function importarEventoDashboard(filePath:string) {
  try {await import(filePath);} catch (error) {}}importarEventoDashboard(eventosDashboard);

  async function importarEventoDashboard_Novo(filePath:string) {
    try {await import(filePath);} catch (error) {}}importarEventoDashboard_Novo(eventosDashboard_Novo);
