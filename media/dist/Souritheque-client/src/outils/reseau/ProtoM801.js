define(["require", "exports", "./Msg801", "../Module801", "../../enums/Communaute", "../crypt/CryptUtil", "../limonadmin/Limonadmin", "../divers/Chips", "../Trad801", "../auth/EnumTypeAuthentification", "../divers/AutorisationJoueur801", "./ChaineOctet", "../../interface/divers/InterfaceConnexionAtlas", "../auth/InfoJoueurPrincipal"], function (require, exports, Msg801_1, Module801_1, Communaute_1, CryptUtil_1, Limonadmin_1, Chips_1, Trad801_1, EnumTypeAuthentification_1, AutorisationJoueur801_1, ChaineOctet_1, InterfaceConnexionAtlas_1, InfoJoueurPrincipal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ProtoM801 = (function () {
        function ProtoM801() {
        }
        ProtoM801.initialisation = function () {
            if (this.dejaInitialise) {
                return;
            }
            this.ajouterPaquet(this.fusionCode(5, 21), function (MSG) {
                var officiel = MSG.lBool();
                var nom = MSG.lChaine();
                InfoJoueurPrincipal_1.InfoJoueurPrincipal.salonEnCours = nom;
                Module801_1.default.instance.changementSalon(nom, officiel);
            });
            this.ajouterPaquet(this.fusionCode(6, 6), function (MSG) {				
				var auteur = MSG.lChaine();
				var message = MSG.lChaine();
				
                message = message.replace(/&lt;/g, "<");
                Module801_1.default.instance.messageChat(message, auteur);
            });
            this.ajouterPaquet(this.fusionCode(6, 9), function (MSG) {
                var message = MSG.lChaine();
                message = message.replace(/<.{1,5}?>/g, "");
                Module801_1.default.instance.messageChat(message, "⚙️");
            });
            this.ajouterPaquet(this.fusionCode(6, 10), function (MSG) {
                var typeCanal = MSG.l8();
                var auteur = MSG.lChaine();
                var message = MSG.lChaine();
                var messageSimple = MSG.lBool();
                var traduction = MSG.lBool();
                var nbParamsTraductions = MSG.l8();
                var paramsTraduction = [];
                for (var i = void 0; i < nbParamsTraductions; i++) {
                    paramsTraduction.push(MSG.lChaine());
                }
                if (traduction) {
                    message = Trad801_1.default.trad(message, paramsTraduction);
                }
                message = message.replace(/&lt;/g, "<");
                message = message.replace(/<.{1,5}?>/g, "");
                Module801_1.default.instance.messageChat(message, "-" + auteur + "-", null, typeCanal);
            });
            this.ajouterPaquet(this.fusionCode(6, 20), function (MSG) {
                var ongletEnCours = MSG.lBool();
                var message = MSG.lChaine();
                var param = [];
                var nbParam = MSG.l8();
                if (nbParam) {
                    for (var i = 0; i < nbParam; i++) {
                        param.push(MSG.lChaine());
                    }
                }
                if (message.charAt(0) == "$") {
                    param.unshift(message);
                    message = Trad801_1.default.trad.apply(null, param);
                }
                message = message.replace(/&lt;/g, "<");
                message = message.replace(/<.{1,5}?>/g, "");
                Module801_1.default.instance.messageChat(message, "-", null);
                console.log(message);
            });
            this.ajouterPaquet(this.fusionCode(12, 2), function (MSG) {
                var lienPaiement = MSG.lChaine();
                var token = MSG.lChaine();
                Module801_1.default.instance.obtentionLienPaiement(lienPaiement, token);
            });
            this.ajouterPaquet(this.fusionCode(12, 3), function (MSG) {
                Module801_1.default.instance.echecPaiement(MSG.lChaine());
            });
            this.ajouterPaquet(this.fusionCode(12, 12), function (MSG) {
                var listePaliers = [];
                var num = MSG.l8();
                for (var i = 0; i < num; i++) {
                    var infoPaiement = {};
                    infoPaiement.identifiant = MSG.l32s();
                    infoPaiement.fraises = MSG.l16();
                    infoPaiement.fraisesBase = infoPaiement.fraises;
                    infoPaiement.prix = MSG.l32s() / 100;
                    infoPaiement.monnaie = MSG.lChaine();
                    listePaliers.push(infoPaiement);
                }
                Module801_1.default.instance.affichagePaliersPaiement(listePaliers);
            });
            this.ajouterPaquet(this.fusionCode(24, 5), function (MSG) {
                var typeStaff = MSG.l8();
                var infoStaff = [];
                var nbComptesStaff = MSG.l8();
                for (var i = 0; i < nbComptesStaff; i++) {
                    var chaineCommunaute = MSG.lChaine();
                    var nomJoueur = MSG.lChaine();
                    var nomSalon = MSG.lChaine();
                    infoStaff.push({ communaute: chaineCommunaute, nom: nomJoueur, salon: nomSalon });
                }
            });
            this.ajouterPaquet(this.fusionCode(26, 2), function (MSG) {
                var identifiantJoueur = MSG.l32s();
                var nomJoueur = MSG.lChaine();
                var tempsJeu = MSG.l32s();
                var codeCommunaute = MSG.l8();
                var codeJoueurPartie = MSG.l32s();
                var estInvite = MSG.lBool();
                var droits = [];
                var nbDroits = MSG.l8();
                for (var i = 0; i < nbDroits; i++) {
                    droits.push(MSG.l8());
                }
                Module801_1.default.instance.autorisationJoueur = new AutorisationJoueur801_1.AutorisationJoueur801(droits);
                var aUnDroitPublique = MSG.lBool();
                var tailleMessage = MSG.l16();
                Module801_1.default.instance.authentification(identifiantJoueur, nomJoueur, tempsJeu, Communaute_1.default.recupParCode(codeCommunaute, Communaute_1.default.ANGLAIS_INT), codeJoueurPartie, estInvite, droits, aUnDroitPublique, tailleMessage);
            });
            this.ajouterPaquet(this.fusionCode(26, 3), function (MSG) {
                Module801_1.default.instance.nombreJoueurs = MSG.l32s();
                InfoJoueurPrincipal_1.InfoJoueurPrincipal.langueDefaut = MSG.lChaine();
                InfoJoueurPrincipal_1.InfoJoueurPrincipal.pays = MSG.lChaine();
                Module801_1.default.instance.connecteAuServeur = true;
                Module801_1.default.instance.envoyer(ProtoM801.selectionLangue(InfoJoueurPrincipal_1.InfoJoueurPrincipal.langueDefaut));
            });
            this.ajouterPaquet(this.fusionCode(26, 12), function (MSG) {
                var code = MSG.l8();
                var suggestion = MSG.lChaine();
                var cookie2FA = MSG.lChaine();
                Module801_1.default.instance.echecAuthentification(code, suggestion, cookie2FA);
            });
            this.ajouterPaquet(this.fusionCode(26, 20), function (MSG) {
                var data = new ChaineOctet_1.default(MSG.lTableauOctetsCompresse());
                var largeur = data.l16();
                var hauteur = data.l16();
                var nbPixels = data.l16();
                var canevas = document.createElement("canvas");
                canevas.width = largeur;
                canevas.height = hauteur;
                var contexte = canevas.getContext("2d");
                var imageData = contexte.getImageData(0, 0, canevas.width, canevas.height);
                for (var i = 0; i < nbPixels * 4; i += 4) {
                    var pixel = data.l32s();
                    imageData.data[i] = pixel & 0xFF;
                    imageData.data[i + 1] = (pixel >>> 8) & 0xFF;
                    imageData.data[i + 2] = (pixel >>> 16) & 0xFF;
                    imageData.data[i + 3] = (pixel >>> 24) & 0xFF;
                }
                contexte.putImageData(imageData, 0, 0);
                Module801_1.default.instance.afficherInterfaceCreationCompte(canevas);
            });
            this.ajouterPaquet(this.fusionCode(28, 2), function (MSG) {
            });
            this.ajouterPaquet(this.fusionCode(28, 6), function (MSG) {
                Module801_1.default.instance.envoyer(ProtoM801.pong(MSG.l8s()));
            });
            this.ajouterPaquet(this.fusionCode(28, 16), function (MSG) {
                var code = MSG.l8s();
                var mail = MSG.lChaine();
                Module801_1.default.instance.afficherGestionCompte(code, mail);
            });
            this.ajouterPaquet(this.fusionCode(28, 46), function (MSG) {
                var typeTexte = MSG.l8();
                var tag = MSG.lChaine();
                if (tag == "") {
                    tag = null;
                }
                var tailleMessage = (MSG.l8() & 0xFF) << 16 | (MSG.l8() & 0xFF) << 8 | (MSG.l8() & 0xFF);
                var data = MSG.lTableauOctets(tailleMessage);
                var texteLogs = new TextDecoder("utf-8").decode(data);
                if (typeTexte >= 3) {
                    typeTexte -= 3;
                    texteLogs = Trad801_1.default.trad(texteLogs);
                }
                Module801_1.default.instance.afficherLogs(texteLogs, typeTexte, tag);
            });
            this.ajouterPaquet(this.fusionCode(28, 62), function (MSG) {
            });
            this.ajouterPaquet(this.fusionCode(28, 88), function (MSG) {
                var tempsAvantExtinction = MSG.l32s();
                var auteurMessage = Trad801_1.default.trad("$serveur").toUpperCase();
                if (tempsAvantExtinction > 60000) {
                    Module801_1.default.instance.messageChat(Trad801_1.default.trad("$serveur.extinctionMin", Math.floor(tempsAvantExtinction / 60000.0)), auteurMessage);
                }
                else {
                    Module801_1.default.instance.messageChat(Trad801_1.default.trad("$serveur.extinctionSec", Math.floor(tempsAvantExtinction / 1000.0)), auteurMessage);
                }
            });
            this.ajouterPaquet(this.fusionCode(28, 98), function (MSG) {
                Module801_1.default.instance.changementServeur(MSG.lChaine());
            });
            this.ajouterPaquet(this.fusionCode(60, 4), function (MSG) {
            });
            this.ajouterPaquet(this.fusionCode(7, 1), function (MSG) {
            });
            this.ajouterPaquet(this.fusionCode(7, 30), function (MSG) {
            });
            this.ajouterPaquet(0xFFC1, function (MSG) {
                if (Chips_1.Chips.estAffiche) {
                    Chips_1.Chips.instance.valeurServeur(MSG.lChaine(), MSG.lChaine(), MSG.l32s(), MSG.l32s(), MSG.l32s());
                }
            });
            this.ajouterPaquet(0xFFC2, function (MSG) {
                if (Chips_1.Chips.estAffiche) {
                    Chips_1.Chips.instance.valeurCourbe(MSG.lChaine(), MSG.l32s(), MSG.l32s());
                }
            });
            this.ajouterPaquet(0xFE01, function (MSG) {
                var limonade = Limonadmin_1.Limonadmin.recupLimonadmin(MSG.lChaine());
                limonade.initialisation(MSG);
                document.body.appendChild(limonade.elementHTML);
            });
            this.ajouterPaquet(0xA050, function (MSG) {
                if (InterfaceConnexionAtlas_1.InterfaceConnexionAtlas.instance) {
                    InterfaceConnexionAtlas_1.InterfaceConnexionAtlas.instance.receptionErreur(MSG.lec());
                }
            });
            this.ajouterPaquet(0xA051, function (MSG) {
                if (InterfaceConnexionAtlas_1.InterfaceConnexionAtlas.instance) {
                    InterfaceConnexionAtlas_1.InterfaceConnexionAtlas.instance.modeCreationCompte(MSG.lChaineOctet(MSG.lec()));
                    InterfaceConnexionAtlas_1.InterfaceConnexionAtlas.instance.desactivationInterface(false);
                }
            });
            this.ajouterPaquet(0xA052, function (MSG) {
                if (InterfaceConnexionAtlas_1.InterfaceConnexionAtlas.instance) {
                    InterfaceConnexionAtlas_1.InterfaceConnexionAtlas.instance.majCaptcha(MSG.lChaineOctet(MSG.lec()));
                }
            });
            this.ajouterPaquet(0xA053, function (MSG) {
                Module801_1.default.instance.affichageInterfaceConnexion(MSG.lChaine());
            });
            this.ajouterPaquet(0xA054, function () {
                InterfaceConnexionAtlas_1.InterfaceConnexionAtlas.fermer();
            });
            this.ajouterPaquet(0xB005, function (MSG) {
                InfoJoueurPrincipal_1.InfoJoueurPrincipal.langueEnCours = MSG.lChaine();
                InfoJoueurPrincipal_1.InfoJoueurPrincipal.drapeauPays = MSG.lChaine();
                InfoJoueurPrincipal_1.InfoJoueurPrincipal.sensLectureInverse = MSG.lBool();
                InfoJoueurPrincipal_1.InfoJoueurPrincipal.langueCaractereNonLatin = MSG.lBool();
                InfoJoueurPrincipal_1.InfoJoueurPrincipal.policeLangue = MSG.lChaine();
                Module801_1.default.instance.selectionLangue(InfoJoueurPrincipal_1.InfoJoueurPrincipal.langueEnCours, InfoJoueurPrincipal_1.InfoJoueurPrincipal.drapeauPays, function () {
                    Trad801_1.default.selectionnerLangue(InfoJoueurPrincipal_1.InfoJoueurPrincipal.langueEnCours);
                    Module801_1.default.instance.connexionServeur(InfoJoueurPrincipal_1.InfoJoueurPrincipal.langueEnCours, InfoJoueurPrincipal_1.InfoJoueurPrincipal.drapeauPays, InfoJoueurPrincipal_1.InfoJoueurPrincipal.pays, Module801_1.default.instance.nombreJoueurs);
                });
            });
            this.dejaInitialise = true;
        };
        ProtoM801.ajouterPaquet = function (IDENTIFIANT, FONCTION, ECRASER) {
            if (ECRASER === void 0) { ECRASER = false; }
            if (!ECRASER && this.indexPaquetLecture[IDENTIFIANT]) {
                throw new Error("Impossible d'avoir plusieurs paquets avec le même identifiant : 0x" + IDENTIFIANT.toString(16) + " (" + (IDENTIFIANT >> 8) + ", " + (IDENTIFIANT & 0xFF) + ")");
            }
            this.indexPaquetLecture[IDENTIFIANT] = FONCTION;
        };
        ProtoM801.receptionMessage = function (CODE, MSG) {
            var fonctionLecturePaquet = this.indexPaquetLecture[CODE];
            if (fonctionLecturePaquet) {
                fonctionLecturePaquet(MSG);
                return;
            }
            //throw new Error("Reception message inconnu : 0x" + CODE.toString(16) + " (" + (CODE >> 8) + ", " + (CODE & 0xFF) + ")");
        };
        ProtoM801.fusionCode = function (CODE_1, CODE_2) {
            return (CODE_1 << 8) | (CODE_2 & 0xFF);
        };
        ProtoM801.changementSalon = function (COMMUNAUTE, SALON, AUTO) {
            if (AUTO === void 0) { AUTO = false; }
            return Msg801_1.default.nv(this.fusionCode(5, 38)).e8(COMMUNAUTE).eChaine(SALON).eBool(AUTO);
        };
        ;
        ProtoM801.messageChat = function (MESSAGE) {
            return Msg801_1.default.nv(this.fusionCode(6, 6)).eChaine(MESSAGE);
        };
        ;
        ProtoM801.messageChatStaff = function (TYPE, MESSAGE) {
            return Msg801_1.default.nv(this.fusionCode(6, 10)).e8(TYPE).eChaine(MESSAGE);
        };
        ;
        ProtoM801.commande = function (COMMANDE) {
            return Msg801_1.default.nv(this.fusionCode(6, 26)).eChaine(COMMANDE);
        };
        ProtoM801.changementCommunaute = function (COMMUNAUTE) {
            return Msg801_1.default.nv(this.fusionCode(8, 2)).e8(COMMUNAUTE.code).e8(0);
        };
        ;
        ProtoM801.achatFraisesPaypal = function (ID_PALIER) {
            return Msg801_1.default.nv(this.fusionCode(12, 1)).e32(ID_PALIER);
        };
        ProtoM801.demanderListePaliers = function (TYPE) {
            return Msg801_1.default.nv(this.fusionCode(12, 10)).e8(TYPE);
        };
        ProtoM801.creationCompte = function (NOM, PASSWORD, MAIL, CAPTCHA) {
            return Msg801_1.default.nv(this.fusionCode(26, 7)).eChaine(NOM).eChaine(CryptUtil_1.default.hash(PASSWORD)).eChaine(MAIL).eChaine(CAPTCHA).eChaine("").eChaine("");
        };
        ;
        ProtoM801.connexionJoueur = function (NOM, PASSWORD, TYPE_AUTHENTIFICATION) {
            if (TYPE_AUTHENTIFICATION === void 0) { TYPE_AUTHENTIFICATION = EnumTypeAuthentification_1.EnumTypeAuthentification.NORMAL; }
            if (TYPE_AUTHENTIFICATION == EnumTypeAuthentification_1.EnumTypeAuthentification.NORMAL) {
                PASSWORD = PASSWORD ? CryptUtil_1.default.hash(PASSWORD) : "";
            }
            var msg = Msg801_1.default.nv(this.fusionCode(26, 8));
            msg.eChaine(NOM);
            msg.eChaine(PASSWORD);
            msg.eChaine("-");
            msg.eChaine("");
            msg.e32(0);
            msg.e8(TYPE_AUTHENTIFICATION);
            msg.eChaine("");
			
            return msg;
        };
        ;
        ProtoM801.enregistrerClefBeta = function (CLEF_BETA) {
            return Msg801_1.default.nv(this.fusionCode(26, 14)).eChaine(CLEF_BETA);
        };
        ProtoM801.demandeCaptcha = function () {
            return Msg801_1.default.nv(this.fusionCode(26, 20));
        };
        ProtoM801.antiAFK = function () {
            return Msg801_1.default.nv(this.fusionCode(26, 26));
        };
        ;
        ProtoM801.connexionServeur = function (NOM_JEU, VERSION, VERSION_MODULE, SALON) {
			return Msg801_1.default.nv(this.fusionCode(28, 1)).e16(VERSION).eChaine(InfoJoueurPrincipal_1.InfoJoueurPrincipal.langueClient).eChaine("-").eChaine("js").eChaine(navigator.userAgent).e32(0)
                .eChaine("-").eChaine("-").eChaine("-").e32(0).e32(0).eChaine(NOM_JEU).eChaine(VERSION_MODULE).eChaine(SALON);
        };
        ProtoM801.pong = function (CODE) {
            return Msg801_1.default.nv(this.fusionCode(28, 6)).e8(CODE);
        };
        ProtoM801.creationCompteSteam = function (IDENTIFIANT, KEY, NOM) {
            return Msg801_1.default.nv(this.fusionCode(28, 23)).eChaine(IDENTIFIANT).eChaine(KEY).eChaine(NOM);
        };
        ProtoM801.identifiantSteam = function (IDENTIFIANT, CODE_LANGUE) {
            return Msg801_1.default.nv(this.fusionCode(26, 12)).eChaine(IDENTIFIANT).eChaine(CODE_LANGUE);
        };
        ProtoM801.interfaceCreationCompteAtlas = function () {
            return Msg801_1.default.nv(0xA050);
        };
        ProtoM801.creationCompteAtlas = function (PSEUDO, HASH_MDP, EMAIL, CAPTCHA) {
            return Msg801_1.default.nv(0xA051).eChaine(PSEUDO).eChaine(HASH_MDP).eChaine(EMAIL).eChaine(CAPTCHA);
        };
        ProtoM801.connexionCompteAtlas = function (PSEUDO, HASH_MDP) {
            return Msg801_1.default.nv(0xA052).eChaine(PSEUDO).eChaine(HASH_MDP);
        };
        ProtoM801.demandeAffichageInterfaceConnexionAtlas = function () {
            return Msg801_1.default.nv(0xA053);
        };
        ProtoM801.selectionLangue = function (LANGUE) {
            var msg = Msg801_1.default.nv(0xB001);
            msg.eChaine(LANGUE);
            return msg;
        };
        ProtoM801.indexPaquetLecture = {};
        ProtoM801.dejaInitialise = false;
        return ProtoM801;
    }());
    exports.default = ProtoM801;
});
//# sourceMappingURL=ProtoM801.js.map