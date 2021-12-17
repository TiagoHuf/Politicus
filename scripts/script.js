//Variáveis
let urlGoverno = 'https://dadosabertos.camara.leg.br/api/v2/';//Link base da API
let campoDeputados = document.querySelector('#listaDeputados');//Tag do select de deputados
let opcaoDeputados = document.querySelector('#tipoDeputados');//Tag do título do select de deputados
let opcaoPartidos = document.querySelector('#tipoPartidos');//Tag do título do select de partidos 
let campoPartidos = document.querySelector('#listaPartidos');//Tag do select de partidos
let campoRelatorio = document.querySelector('#relatorio');//Tag da lista do relatório
let campoSiglaPartido = document.querySelector('#campoSiglaPartido');//Tag do input de sigla do partido
let campoNomeDeputado = document.querySelector('#campoNomeDeputado');//Tag do input de nome de deputado
let campoTotal = document.querySelector('#total');//Tag do footer da página que contém o total das despesas
let cardDeputado = document.querySelector('#cardDeputado');//Tag do Card de deputado
let cardPartido = document.querySelector('#cardPartido');//Tag do Card de partido
let botaoDeputados = document.querySelector('#buscarDeputados');//Tag do botão que busca todos os deputados
let selectMes = document.querySelector('#selectMes');//Tag do select filtro de Mês
let selectAnos = document.querySelector('#selectanos');//Tag do select filtro de Ano
let selectDiaInicial = document.querySelector('#diainicial');//Tag do select filtro de dia inicial
let selectDiaFinal = document.querySelector('#diafinal');//Tag do select filtro de dia final
let botaoLegislatura = document.querySelector('#botaoLegislatura');//Tag do botão dropdown de legislaturas

//Variáveis globais
let deputado = "";//Variável que guarda link para request de deputado
let partido;//Variável que guarda link para request de deputado por partido
let partidos = "";//Variável que guarda link para request de partido por sigla
let id = "";//Variável para input de links em requests
let nome = "";//Variável para guardar link de busca por nome de deputado

//Funções que são executadas assim que a página carrega
window.onload = retornaDeputados(id);
window.onload = requestLegislatura('?ordem=DESC&ordenarPor=id');
window.onload = inicio();
window.onload = buscarPartidos();
window.onload = requestDeputado(nome);

//-----------------------------------------------------------Deputados-----------------------------------------------------------------

//Função que chama os requests de deputados
function inicio() {

    //Variável que receberá código html
    let texto = "<h4>Todos os Deputados</h4>";

    //Muda a interface de acordo com o que está sendo exibido
    opcaoDeputados.innerHTML = texto;

    //Chama a request de deputados passando de parâmetro um link que retorna todos os deputados ativos
    retornaDeputados('?itens=999&ordem=ASC&ordenarPor=nome');

}

//Ação do botão de buscar todos os deputado
document.querySelector('#buscarDeputados').onclick = function () {

    //Chama a request de deputados passando de parâmetro um link que retorna todos os deputados ativos
    retornaDeputados('?itens=999&ordem=ASC&ordenarPor=nome');

    //Variável que receberá código html
    let texto = "<h4>Todos os Deputados</h4>";

    //Muda a interface de acordo com o que está sendo exibido
    opcaoDeputados.innerHTML = texto;

}

//Request de lista de deputados
function retornaDeputados(id) {

    //Variável que recebe o método de requisição 
    let request = new XMLHttpRequest();

    //Passa o link que será feito a request do tipo "GET"
    request.open('GET', urlGoverno + "deputados" + id, true);

    //Cria a thread para o request
    request.onload = function (e) {

        //Verifica se houve sucesso na comunicão
        if (request.readyState === 4) {

            //Verifica se houve sucesso na obtenção de resposta
            if (request.status === 200) {

                //Verifica se a função que chamou o request passou um link personalizado
                if (deputado != "") {
                    deputado = "";//Limpa esse link para próximas requisições

                    //Chama a função que exibe o deputado passando o objeto json retornado pela api
                    exibeDeputado(request.response);

                    //Alterações na interface para condizer com a busca
                    let texto = "<h4>" + request.response.dados[0].nome + "</h4>";
                    opcaoDeputados.innerHTML = texto;

                    //Caso a request seja feita sem a passagem de parâmetro:
                } else {

                    //Gera um select de deputados com todos os deputados ativos
                    geraCampoDeputados(request.response);

                    //Gera tambem os selects dos filtros de intervalo de tempo
                    periodo();
                }

                //Tratamento de erro de request
            } else {
                alert('Erro ao abrir a requisição ' + request.statusText);
            }
        }
    };

    //Tratamento de erro da thread
    request.onerror = function (e) {
        alert('Erro ' + request.statusText);
    }

    //Determina o tipo de objeto desejado
    request.responseType = 'json';

    //Executa a request
    request.send(null);

}

//Função que gera o select de deputados
function geraCampoDeputados(jsonList) {

    //Variável que receberá o código html do select de deputados
    let selectDeputados = '<select class="form-select" aria-label="Default select example"' +
        'id=selectDeputados onchange="requestDeputado()">'

    //Condição para exibir na interface caso nenhum deputado for encontrado
    if (jsonList.dados.length == 0) {

        //Atribui ao select uma mensagem adequada
        selectDeputados += '<option>Nenhum Deputado Encontrado</option>'

        //Variável que receberá código html
        let texto = "<h4>Nenhum Deputado Encontrado</h4>";

        //Gera o código na tag html
        opcaoDeputados.innerHTML = texto;

    }

    //Laço que preenche o select com os deputados obtidos na request
    for (let i = 0; i < jsonList.dados.length; i++) {
        selectDeputados += '<option value="' + (i + 1) + '">' + jsonList.dados[i].nome + '</option>';
    }

    //Fechamento do código html
    selectDeputados += '</select>';

    //Gera o campo no html
    campoDeputados.innerHTML = selectDeputados;

}

//-----------------------------------------------------------Deputados por Partido-----------------------------------------------------

//Função que exibe nome do partido escolido e chama a request do mesmo
function buscarDeputadosPartido(sigla) {

    //Tratamento que determina se será chamada a request de deputado pelo partido buscado (input) ou pelo partido selecionado (select)
    if (sigla == null) {//Caso nenhuma sigla seja informada

        //Variável que referencia o select de partidos
        let selectPartido = document.getElementById('selectPartidos');

        //Variável global que recebe o link para a busca de deputado por partido
        partido = "?siglaPartido=" + selectPartido.options[selectPartido.selectedIndex].text + "&ordem=ASC&ordenarPor=nome";

        //Variável global que recebe o link para a busca de partido por sigla
        partidos = "?sigla=" + selectPartido.options[selectPartido.selectedIndex].text + "&ordem=ASC&ordenarPor=sigla";

        //Chamado da request de deputado passando como parametro o link gerado acima
        retornaDeputados(partido);

        //Variável que receberá código html
        let texto = "<h4>Deputados do " + selectPartido.options[selectPartido.selectedIndex].text + '</h4>';

        //Gerando alterações na interface para condizer com a busca
        opcaoDeputados.innerHTML = texto;

    } else {//Caso seja informada uma sigla

        //Concatena a sigla informada com o link necessário para a request de deputado por sigla
        partido = "?siglaPartido=" + sigla + "&ordem=ASC&ordenarPor=nome";

        //Faz o mesmo com o link para a request de partidos
        partidos = "?sigla=" + sigla + "&ordem=ASC&ordenarPor=sigla";

        //Chama a request de deputados com o link gerado acima
        retornaDeputados(partido);

        //Variável que receberá código html
        let texto = "<h4>Deputados do " + sigla.toUpperCase(sigla) + '</h4>';

        //Gerando alterações na interface para condizer com a busca
        opcaoDeputados.innerHTML = texto;

    }

    //Chama a request do partido para qualquer um dos casos
    retornaPartidos(partidos);

}

//-----------------------------------------------------------Exibir Deputado-----------------------------------------------------------

//Ação do botão de busca por nome de deputado
document.querySelector('#buscarNomeDeputado').onclick = function () {

    let campoNomeDeputado = document.getElementById('campoNomeDeputado');

    //Ao pressionado chama a request de deputado com o nome informado no campo nome
    requestDeputado(campoNomeDeputado.value);

    //Limpa o select de deputados até a request ser executada
    opcaoDeputados.innerHTML = '';
    campoNomeDeputado.value = "";

}

//Função que executa a request do deputado pela caixa de opções ou pela caixa de busca
function requestDeputado(nome) {

    //Verifica se foi passado algum parâmetro para a função
    if (nome == null) {//Caso não seja passado:

        //Referencia o select de deputados no html
        let selectDeputado = document.getElementById('selectDeputados');

        //Cria um link concatenando o deputado escolhido no select
        deputado = "?nome=" + selectDeputado.options[selectDeputado.selectedIndex].text + "&ordem=ASC&ordenarPor=nome";

        //Faz a request com esse link 
        retornaDeputados(deputado);

    } else {//Case seja passado

        //Referencia o input de nome de deputado
        let selectDeputado = document.getElementById('campoNomeDeputado');

        //Cria u link concatenando o nome digitado pelo usuário
        deputado = "?nome=" + nome + "&ordem=ASC&ordenarPor=nome";

        //Faz a request com esse link
        retornaDeputados(deputado);

    }

}

//Função que gera o card do deputado
function exibeDeputado(jsonObj) {

    //Variável que carregará o código html do card do deputado
    let deputado = '<div class="card" style="width: 62%; height: 75%"><img src="' + jsonObj.dados[0].urlFoto + '" class="card-img-top' +
        'alt="..." id="foto"><div class="card-body"><h5 class="card-title">' + jsonObj.dados[0].nome + '</h5><p class="card-text"><b>Partido' +
        ':</b> ' + jsonObj.dados[0].siglaPartido + '<br><b>Estado:</b> ' + jsonObj.dados[0].siglaUf + '</div></div>';

    //Gerando o card no html com os dados optidos no objeto json da api
    cardDeputado.innerHTML = deputado;

    //Chamado da função que gera a lista de gastos do deputado em questão, onde é passado de referência o seu respectivo ID
    relatorio(jsonObj.dados[0].id);

    //Variável que referencia a tag do select de deputados no html
    let selectDeputado = document.getElementById('selectDeputados');

    //Seta no select atual o nome do deputado referente às informações supracitadas
    selectDeputado.options[selectDeputado.selectedIndex].innerHTML = jsonObj.dados[0].nome;

    //Chamado do request de partido de acordo com o deputado que está sendo exibido, passando como parâmetro a sigla de seu partido
    retornaPartidos("?sigla=" + jsonObj.dados[0].siglaPartido + "&ordem=ASC&ordenarPor=sigla");

    //Varíavel que carregará um código html
    let texto = "<h4>Partido</h4>";

    //Alteração na interface para condizer com o partido referente ao deputado em questão
    partidos = jsonObj.dados[0].siglaPartido;

    //Gerando essa alteração no html
    opcaoPartidos.innerHTML = texto;

}

//Função que requisita as despesas do deputado
function relatorio(id) {

    //Variáveis que referenciam os selcts de filtro de intervalo de tempo
    let selectMes = document.getElementById('selectMes');
    let selectAno = document.getElementById('selectAnos');

    //Variável que recebe o método de requisição 
    let request = new XMLHttpRequest();

    //Abre a requisição do tipo "GET" concatenando o link recebido como parâmetro com os filtros escolhidos
    request.open('GET', urlGoverno + "deputados/" + id + "/despesas?ano=" + selectAno.options[selectAno.selectedIndex].value +
        "&mes=" + selectMes.options[selectMes.selectedIndex].value + "&ordem=DESC&ordenarPor=mes", true);

    //Cria uma thread para rodar a requisição
    request.onload = function (e) {
        //Verifica se houve sucesso na comunicão
        if (request.readyState === 4) {

            ////Verifica se houve sucesso na obtenção de resposta
            if (request.status === 200) {

                //Chama a função que gera a lista do relatório
                geraRelatorioGastos(request.response);

                //Caso contrário
            } else {
                //Exibe o respectivo erro
                alert('Erro ao abrir a requisição ' + request.statusText);
            }
        }
    };

    //Verifica se houve erro na thread
    request.onerror = function (e) {

        //Exibe o erro adequado
        alert('Erro ' + request.statusText);
    }

    //Determina o tipo de objeto que deseja receber
    request.responseType = 'json';

    //Executa a request
    request.send(null);

    //Função que rola a página para uma posição de melhor visualização
    setTimeout(function () {
        this.location = "#nav";
    }, 250);

}

//-----------------------------------------------------------Partidos------------------------------------------------------------------

//Função que chama os requests de partidos
function buscarPartidos() {

    //Chamado da função com o link que retorna todos os partidos ativos no momento
    retornaPartidos("?itens=999&ordem=ASC&ordenarPor=sigla");

    //Alteração da interface para condizer com a busca
    let texto = "<h4>Partidos ativos</h4>";

    //Gerando o novo texto da interface
    opcaoPartidos.innerHTML = texto;

}

//Request de lista de partidos
function retornaPartidos(id) {
    let request = new XMLHttpRequest();
    request.open('GET', urlGoverno + "partidos" + id, true);
    request.onload = function (e) {
        if (request.readyState === 4) {
            if (request.status === 200) {
                if (partidos != "") {
                    partidos = "";
                    retornaCardPartidos(request.response.dados[0].id);
                } else {
                    geraCampoPartidos(request.response);
                }
            } else {
                alert('Erro ao abrir a requisição ' + request.statusText);
            }
        }
    };
    request.onerror = function (e) {
        alert('Erro ' + request.statusText);
    }
    request.responseType = 'json';
    request.send(null);
}

//Requisição do card partido
function retornaCardPartidos(id) {
    let request = new XMLHttpRequest();
    request.open('GET', urlGoverno + "partidos/" + id, true);
    request.onload = function (e) {
        if (request.readyState === 4) {
            if (request.status === 200) {
                exibePartido(request.response);
            } else {
                alert('Erro ao abrir a requisição ' + request.statusText);
            }
        }
    };
    request.onerror = function (e) {
        alert('Erro ' + request.statusText);
    }
    request.responseType = 'json';
    request.send(null);
}

//Função de busca por sigla
document.querySelector('#buscarSiglaPartido').onclick = function () {

    //Chamada da request com o partido informado pelo usuário
    buscarDeputadosPartido(campoSiglaPartido.value);

    //Alteração na interface pra condizer com a busca do usuário
    opcaoPartidos.innerHTML = "<h4>Partido</h4>";

    //variável que referencia a tag do select dos partidos no html
    let selectPartidos = document.getElementById('selectPartidos');

    //Muda a opção selecionada do select para a sigla informada pelo usuário
    selectPartidos.options[selectPartidos.selectedIndex].innerHTML = campoSiglaPartido.value.toUpperCase(campoSiglaPartido.value);
}

//Função que gera o select de partidos
function geraCampoPartidos(jsonList) {

    //Variável que receberá o código html do selct de partidos
    let selectPartidos = '<select class="form-select" aria-label="Default select example"' +
        'id=selectPartidos onchange="buscarDeputadosPartido()">'

    //Laço que preenche as opções do select com os partidos recebidos da api
    for (let i = 0; i < jsonList.dados.length; i++) {
        selectPartidos += '<option value="' + (i + 1) + '">' + jsonList.dados[i].sigla + '</option>';
    }

    //Fechamento do código html
    selectPartidos += '</select>'

    //Gerando o select na sua respectiva tag
    campoPartidos.innerHTML = selectPartidos;
}

//Função que exibe card do Partido
function exibePartido(jsonObj) {

    //Condição para exibir "Inexistente" caso o lider do partido seja nulo
    if (jsonObj.dados.status.lider.nome === null) {
        jsonObj.dados.status.lider.nome = "Inexistente"
    }

    //Variável que receberá o código html do card do partido
    let partido = '<div class="card" style="width: 80%;"><img src="' + jsonObj.dados.urlLogo + '" class="card-img-top" alt="..." ' +
        'id="img"><div class="card-body"><h5 class="card-title">' + jsonObj.dados.nome + '</h5><p class="card-text"><b>Situação:</b>' +
        jsonObj.dados.status.situacao + '<br><b>Lider:</b> ' + jsonObj.dados.status.lider.nome + '</div></div>';

    //Gera o card com as informações obtidas no json da api

    cardPartido.innerHTML = partido;

}

//Função que trata imagem não disponível
window.addEventListener('error', function (e) {

    //Variável que referencia a imagem no html (gerado dinamicamente)
    let foto = document.getElementById('img');

    //O atributo source revebe um novo link ("Not Found Image")
    foto.src = "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg";
    console.log(e);
}, true);

//-----------------------------------------------------------Exibir Relatório----------------------------------------------------------

//Função que gera os filtros de período no html
function periodo() {

    //Variáveis que referenciam as tags o html
    let selectDiaInicial = document.getElementById('diainicial');
    let selectDiaFinal = document.getElementById('diafinal');

    //Váriáveis que recebem o código html dos selects
    let dias = '<h4>Entre </h4><select class="form-select" aria-label="Default select example" style="width: 50%;" onchange=' +
        '"requestDeputado()" id=selectdiainicial>';
    let diasf = '<h4>E </h4><select class="form-select" aria-label="Default select example" style="width: 50%;" onchange="request' +
        'Deputado()" id=selectdiafinal>';

    //Laço que preenche o dia inicial de 1 a 31
    for (let j = 1; j <= 31; j++) {
        dias += '<option value="' + j + '">' + j + '</option>';
    }

    //Fechamento da tag
    dias += '</select>';

    //Transformando em html
    selectDiaInicial.innerHTML = dias;

    //Laço que preenche o dia final de 1 a 31
    for (let j = 31; j > 1; j--) {
        diasf += '<option value="' + j + '">' + j + '</option>';
    }
    //Fechamento da tag
    diasf += '</select>';

    //Transformando em html
    selectDiaFinal.innerHTML = diasf;
}

//Função que gera a tabela dos gastos
function geraRelatorioGastos(jsonList) {

    //Variável que recebe o código html
    let relatorioGastos = '<table class="table"><thead><tr><th scope="col">Data</th><th scope="col">' +
        'Fornecedor</th><th scope="col">Valor</th><th scope="col">DANFE</th></tr></thead><tbody>';

    //Variável que carrega a soma das despesas dos deputados
    let total = 0;

    //Váriáveis que referenciam as tags html
    let selectDiaInicial = document.getElementById('selectdiainicial');
    let selectDiaFinal = document.getElementById('selectdiafinal');

    //Váriáveis que recebem o valor dos filtros (selects) de data de busca das despesas 
    let variavel1 = parseInt(selectDiaInicial.options[selectDiaInicial.selectedIndex].value);
    let variavel2 = parseInt(selectDiaFinal.options[selectDiaFinal.selectedIndex].value);

    //Variável que faz a troca caso o número 1 seja maior que o 2, para manter a integridade da pesquisa por intervalo de tempo
    if (variavel1 > variavel2) {
        let k = variavel1;
        variavel1 = variavel2;
        variavel2 = k;
    }

    //Laço que irá percorrer a lista de despesas
    for (let i = 0; i < jsonList.dados.length; i++) {

        //Variável que recebe a data do documento para filtrar os registros
        let aux = jsonList.dados[i].dataDocumento;

        //Função que corta a data para obter apenas o dia
        try {
            aux = (aux.slice(aux.length - 2));
            aux = parseInt(aux);
        }
        catch (e) {

        }


        //Condição que verifica se o registro está dentro do intervalo de tempo escolhido
        if (aux >= variavel1 && aux <= variavel2) {

            //É acrescentado às colunas as linhas com suas respectivas informações
            relatorioGastos += '<tr><th scope="row">' + aux + '/' + jsonList.dados[i].mes + '/' + jsonList.dados[i].ano + '</th>' +
                '<td>' + jsonList.dados[i].nomeFornecedor + '</td><td>R$' + jsonList.dados[i].valorLiquido +
                '<td><a href="' + jsonList.dados[i].urlDocumento + '" target="_blank">Ver</a></td></th></tr></th>';

            //Soma o gasto que acabou de ser acrescentado ao valor total da despesa
            total += jsonList.dados[i].valorLiquido;
        }

    }

    //Fechamento do código html
    relatorioGastos += '</tbody></table>';

    //Transforma em html e gera a tabela com os dados ja filtrados
    campoRelatorio.innerHTML = relatorioGastos;

    //Função que converte o valor total para Real brasileiro
    total = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

    //Variáveis que referenciam os selects de mês e ano no html
    let selectMes = document.getElementById('selectMes');
    let selectAno = document.getElementById('selectAnos');

    //Gera o footer da página contendo o intervalo de tempo escolhido e o total de despesas contido nele, de acordo com o deputado
    campoTotal.innerHTML = 'Despesas entre ' + selectDiaInicial.options[selectDiaInicial.selectedIndex].text +
        ' e ' + selectDiaFinal.options[selectDiaFinal.selectedIndex].text + ' de ' + selectMes.options[selectMes.selectedIndex].text + ' de ' +
        selectAno.options[selectAno.selectedIndex].value + ': ' + total;

}

//-----------------------------------------------------------Exibir Legislaturas--------------------------------------------------------

//Request de legislaturas do Brasil
function requestLegislatura(id) {
    let request = new XMLHttpRequest();
    request.open('GET', urlGoverno + "legislaturas" + id, true);
    request.onload = function (e) {
        if (request.readyState === 4) {
            if (request.status === 200) {
                geraBotaoLegislatura(request.response);
            } else {
                alert('Erro ao abrir a requisição ' + request.statusText);
            }
        }
    };
    request.onerror = function (e) {
        alert('Erro ' + request.statusText);
    }
    request.responseType = 'json';
    request.send(null);
}

//Função que gera o botão de selecionar a candidatura
function geraBotaoLegislatura(jsonObj) {

    //Variável que referencia a tag no html
    let botao = document.getElementById('botaoLegislatura');

    //Varíavel que receberá o código html
    let botaoLegislatura = "<div>" +
        "<button type='button' class='btn btn-outline-info dropdown-toggle' data-bs-toggle='dropdown' aria-expanded='false'" +
        ">Legislaturas</button><ul class='dropdown-menu'>";

    //Laço que preenche as colunas do dropdown com datas de legislaturas até o momento
    for (let i = 0; i < jsonObj.dados.length; i++) {
        botaoLegislatura += '<li><a class="dropdown-item" href="#"value="' + jsonObj.dados[i].id + '" id="' + jsonObj.dados[i].id +
            '" onclick=retornaPartidos("?dataInicio=' + jsonObj.dados[i].dataInicio + '&dataFim=' + jsonObj.dados[i].dataFim +
            '&ordem=ASC&ordenarPor=sigla")>' + moment(jsonObj.dados[i].dataInicio).format("DD-MM-YYYY") + ' - ' + moment(jsonObj.dados[i].dataFim).format("DD-MM-YYYY") + '</a></li>';
    }

    //Concatena com o fechamento do dropdown
    botaoLegislatura += '<li><hr class="dropdown-divider"></li>' +
        '<li><a class="dropdown-item" href="#" onclick=buscarPartidos()>Exibir ativos</a></li></ul></div>';

    //Transforma em html
    botao.innerHTML = botaoLegislatura;

    //Chamada de função que gera o select de anos
    geraSelectAno();

}

//Função que gera um select com os anos desde a primaira legislatura brasileira até o ano atual
function geraSelectAno() {

    //Variável que referencia a tag no html
    let ano = document.getElementById('selectanos');

    //Variável que receberá o código à sser gerado
    let select = '<li class="nav-item">' +
        '<select class="form-select" aria-label="Default select example" id=selectAnos " onchange="requestDeputado()">';

    //Laço que gera as opçoes do select com um ano cada 
    for (let i = (new Date().getFullYear()); i > 1963; i--) {//Função que obtém o ano atual
        select += '<option value="' + i + '" aria-placeholder="Ano">' + i + '</option>';
    }

    //Fecha o select
    select += '</select></li> ';

    //Transforma em html
    ano.innerHTML = select;

}
