import csv from 'csvtojson';
import express from 'express';
import bodyParser from 'body-parser';
import alert from 'alert';
import { response } from 'express';

const app = express();

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//carrega arquivo csv
const csvFilePath='./public/file/br-capes-bolsistas-uab.csv';

//transforma arquivo csv em json
const file =await csv({delimiter:"auto"}).fromFile(csvFilePath);

//inverte o array
const reversa = file.reverse();

//procura o bolsista 0 por ano
app.post("/pesquisabolsazero/",(req,res) =>{
    //procura o bolsista 0 do ano
    const ano = req.body.ano;
    if (isNaN(ano)) {
        return res.status(400).json({error: "somente numeros"});
    }
    //pesquisa o indice do bolsista 0
    const bolsista = reversa.find(bolsista => bolsista.AN_REFERENCIA === ano);
    if (!bolsista){
        return res.status(400).json({error: "Bolsista não encontrado, verifique o ano informado!!"});
    }else{res.render("resultado_zero",{
        bolsista: bolsista,
        });
    }  
});

//codifica o nome do bolsista desejado
app.post("/codificaNome",(req,res) =>{
     //localiza o bolsista pelo nome
     const nome = req.body.nome.toUpperCase();
     //pesquisa o indice do bolsista
     const bolsista = reversa.find(bolsista => bolsista.NM_BOLSISTA === nome);
     if (!bolsista){
         return res.status(400).json({error: "Bolsista não encontrado, verifique o nome informado!!"});
     }
    //CODIFICA O NOME
    var i = nome.length-1;
    var j = 0;
    var codificado = nome;
    //codifica as letras do nome
    while (j<i) {
        j=j+1;
        i=i-1;
        codificado = codificado.replace(codificado[i],nome[j]);
        codificado = codificado.replace(codificado[j],nome[i]);
        if (i===1 && j===1){
            codificado = codificado.replace(codificado[nome.length-1],nome[0]);
            codificado = codificado.replace(codificado[0],nome[nome.length-1]); 
        };
    };
    //pula uma letra após codificar
    for (i = 0; i < codificado.length; i++) {
        let abc =['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','A'];
        let letraIndex = abc.indexOf(codificado[i]);    
        codificado = codificado.replace(codificado[i], abc[letraIndex+1]);
    }res.render("resultado_codificado",{
        bolsista: bolsista,
        codificado: codificado,
    });
});

//pesquisa a media das bolsas pagas por ano
app.post("/pesquisamedia",(req,res) =>{
    var valorTotal = 0;
    var bolsistas = 0;
    file.forEach(function(bolsista, i) {
        if (bolsista.AN_REFERENCIA === req.body.ano){
            valorTotal = parseFloat(valorTotal) + parseFloat(bolsista.VL_BOLSISTA_PAGAMENTO);
            bolsistas = bolsistas+1;
        }
    })
    let ano = req.body.ano;
    let media=parseFloat(valorTotal/bolsistas).toFixed(2);
    res.render("resultado_media",{
        media: media,
        bolsistas: bolsistas,
        ano: ano,
    });
});

//mostra o ranking das bolsas pagas
app.get("/rankingbolsas",(req,res) => {
    var maiorBolsa1 = 0;
    var maiorBolsa2 = 0;
    var maiorBolsa3 = 0;

    var menorBolsa1 = 1500;
    var menorBolsa2 = 1500;
    var menorBolsa3 = 1500;

    file.forEach(function(bolsista, i) {    
        if (parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) >= maiorBolsa1){
            maiorBolsa1 = parseInt(bolsista.VL_BOLSISTA_PAGAMENTO);
        }
        if ((parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) < maiorBolsa1) && (parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) >= maiorBolsa2)){
            maiorBolsa2 = parseInt(bolsista.VL_BOLSISTA_PAGAMENTO);

        }
        if ((parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) < maiorBolsa2) && (parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) >= maiorBolsa3)){
            maiorBolsa3 = parseInt(bolsista.VL_BOLSISTA_PAGAMENTO);
        }
        if (parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) <= menorBolsa1){
            menorBolsa1 = parseInt(bolsista.VL_BOLSISTA_PAGAMENTO);
        }
        if ((parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) > menorBolsa1)&&(parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) <= menorBolsa2)){
            menorBolsa2=parseInt(bolsista.VL_BOLSISTA_PAGAMENTO);
        }
        if ((parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) > menorBolsa2)&&(parseInt(bolsista.VL_BOLSISTA_PAGAMENTO) <= menorBolsa3)){
            menorBolsa3=parseInt(bolsista.VL_BOLSISTA_PAGAMENTO);
        }        
    })
    res.render("ranking",{
        maiorBolsa1: maiorBolsa1,
        maiorBolsa2: maiorBolsa2,
        maiorBolsa3: maiorBolsa3,
        menorBolsa1: menorBolsa1,
        menorBolsa2: menorBolsa2,
        menorBolsa3: menorBolsa3,
    });
});



//rotas de renderizacao*******************************************//
app.get("/",(req,res) =>{
    res.render("index");
});

app.get("/bolsazero",(req,res) =>{
    res.render("bolsazero");
});

app.get("/codificanome",(req,res) =>{
    res.render("codificanome");
});

app.get("/mediaanualbolsas",(req,res) => {
    res.render("mediabolsas");
});

app.get("/sair",(req,res) => {
    res.render("blank")

});
//****************************************************************//
app.listen(8080,()=>{
    console.log("app rodando!");
});