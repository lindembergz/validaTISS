# ValidaTISS - Validador de Guias TISS

**URL**: https://lindembergz.github.io/validaTISS/

## Sobre o Projeto

Plataforma completa para validação de guias TISS (Troca de Informação em Saúde Suplementar) conforme padrão **TISS 4.02.00** da ANS.

### Funcionalidades

- ✅ Validação de Guias SP/SADT, Consulta, Internação, Honorário e Odontologia
- ✅ Validação contra schemas XSD oficiais
- ✅ Validação de documentos (CPF, CNPJ, CNS)
- ✅ Validação de códigos TUSS, CBO, UF, Conselho Profissional
- ✅ Regras de negócio para prevenção de glosas
- ✅ Dashboard com estatísticas
- ✅ Histórico de validações

## Como executar localmente

O único requisito é ter Node.js & npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Passo 1: Clone o repositório
git clone https://github.com/lindembergz/validaTISS.git

# Passo 2: Navegue até o diretório do projeto
cd validaTISS

# Passo 3: Instale as dependências
npm i

# Passo 4: Inicie o servidor de desenvolvimento
npm run dev
```

## Tecnologias utilizadas

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deploy no GitHub Pages

O projeto está publicado em: https://lindembergz.github.io/validaTISS/

Para gerar um novo build:

```sh
npm run build
```

Os arquivos de build são gerados na pasta `docs/` que é servida pelo GitHub Pages.

## Autor

Lindemberg Cortez
- LinkedIn: [linkedin.com/in/lindembergcortez](https://linkedin.com/in/lindembergcortez)
- Email: suporte@teksoft.info

## Licença

Este projeto é open source.
