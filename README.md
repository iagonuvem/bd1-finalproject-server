# Modelagem
## Usuários
Os usuários são divididos em 7 tipos:

0 - Desenvolvedor (Acesso à todas as funções s/ restrições)
1 - Administrador (Acesso à todas as funções c/ restrições)
2 - Coordenador
3 - Professor
4 - Aluno
5 - Tutor
6 - Responsável

Sendo que o padrão-base para todos está definido em "db-schemas/user.json" e cada tipo de usuário possui uma estrutura de dados própria, portanto, na prática, só há uma Collection "Usuários" na qual os documentos possuem diferentes padrões, de acordo com seu tipo de usuário.