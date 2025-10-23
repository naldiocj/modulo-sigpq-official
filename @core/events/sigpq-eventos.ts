const pathFiles="../../src"
const eventosFuncionario='../../src/funcionario/eventos/funcionario-eventos.ts'
const eventosFuncionario2='../../src/funcionario/eventos/employee-eventos.ts'
const eventosDashboard='../../src/dashboard/eventos/dashboard-eventos.ts'
const eventosDashboard_Novo='../../src/dashboard/eventos/dashboard-novo-eventos.ts'
async function importarEventoFuncionario(filePath:string) {
try {await import(filePath);} catch (error) {}}importarEventoFuncionario(eventosFuncionario);

async function importarEventoFuncionario2(filePath:string) {
try {await import(filePath);} catch (error) {}}importarEventoFuncionario2(eventosFuncionario2);

async function importarEventoDashboard(filePath:string) {
  try {await import(filePath);} catch (error) {}}importarEventoDashboard(eventosDashboard);

  async function importarEventoDashboard_Novo(filePath:string) {
    try {await import(filePath);} catch (error) {}}importarEventoDashboard_Novo(eventosDashboard_Novo);
