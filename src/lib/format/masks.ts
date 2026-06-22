export function onlyDigits(value:string){return value.replace(/\D/g,"");}
export function formatCPF(value:string){const v=onlyDigits(value).slice(0,11);return v.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");}
export function formatCNPJ(value:string){const v=onlyDigits(value).slice(0,14);return v.replace(/(\d{2})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1/$2").replace(/(\d{4})(\d{1,2})$/,"$1-$2");}
export function formatDate(value:string){const v=onlyDigits(value).slice(0,8);if(v.length<=2)return v;if(v.length<=4)return v.replace(/(\d{2})(\d+)/,"$1/$2");return v.replace(/(\d{2})(\d{2})(\d+)/,"$1/$2/$3");}
export function sanitizeFileName(value:string){return (value||"paciente").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"paciente";}
export function applyMask(field:string,value:string){if(field==="cpf")return formatCPF(value);if(field==="cnpj")return formatCNPJ(value);if(field==="dataNasc"||field==="dataExame")return formatDate(value);return value;}
