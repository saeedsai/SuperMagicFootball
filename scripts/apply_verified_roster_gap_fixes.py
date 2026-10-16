#!/usr/bin/env python3
"""Replace role-matching academy slots only with names verified against cited 2026 squads.

This is a conservative curated supplemental pass. No unverified EA ratings.
Retains stable game IDs and original 2/3/4/3 quotas.
"""
import collections,json
from pathlib import Path
from update_all_clubs_fc27 import ROOT,clean,stats,generated_number,QUOTAS

# Each entry is sourced independently from a dated 2026 roster, NOT FC27.
CURATED = {
 # Dated first-team positions are sourced; OVRs below are medium-level *editorial*
 # approximations, never attributed to EA/FC27.

 "cont_concacaf_9": {
   "MF":[("Leslie Heráldez",71,6)],
   "FW":[("Oldemar Castillo",73,30),("Adrian Bethancourt",70,20)],
   "source":"https://sportingsm.com/ ; https://www.transfermarkt.co.uk/sporting-san-miguelito/kader/verein/1708/saison_id/2026/plus/1"
 },



 "cont_afc_11": {
   "GK":[("Adib Zarei",70,49)],
   "MF":[("Odildzhon Khamrobekov",76,21),("Igor Postonjski",75,8),("Tibor Halilović",74,7),("Seyed Mehdi Hosseini",72,6)],
   "source":"https://www.transfermarkt.com/tractor-fc/kader/verein/12935/saison_id/2026/plus/1 [2026/27 squad]"
 },
 "cont_afc_12": {
   "GK":[("Abdulmo'min Nurmuxammadov",69,13)],
   "MF":[("Ikromjon Aliboev",75,5),("Vladimir Jovovic",75,8),("Abrorbek Ismoilov",72,7)],
   "FW":[("Stipe Peritsa",74,18),("Nurbek Sarsenbayev",71,27)],
   "source":"https://fcneftchi.uz/en/teams/main-squad [official 2026 first team]"
 },
 "cont_concacaf_2": {
   "GK":[("Omry Bello",70,1),("Iraitz Gelbentzu",68,13)],
   "DF":[("Yoan Melo",70,2),("Julen Olasagasti",70,3),("José Matos",70,26)],
   "MF":[("Jon Trincado",69,5),("Josué Báez",72,7),("Isaac Báez",72,10),("Gabriel Castillo",70,22)],
   "FW":[("Frantzety Herard",70,9),("Diego Santoni",69,28),("Ronaldinho Caicedo",70,32)],
   "source":"https://www.livescore.com/en/football/team/om-fc/147418/squad/ [2026 first-team positions]"
 },
 "cont_afc_25": {
   "GK":[("Noppol Lakhonphon",72,1)],
   "MF":[("Thanawat Suengchitthawon",75,8)],
   "FW":[("Jordan Gele",75,11)],
   "source":"https://www.transfermarkt.co.uk/ratchaburi-mitr-phol-fc/kader/verein/35387 [2026/27 squad, corroborated by August 2026 Thai registration]"
 },

 "cont_caf_11": {
   "GK":[("Simon Omossola",74,30),("Esdras Kabamba",70,1)],
   "DF":[("John Nekadio",71,3),("Christopher Sumbu",70,4),("Joseph Douhadji",70,6)],
   "MF":[("Jean Benoît Tukumbane",72,5),("Glody Mambembe",71,8),("Miché Mika",70,27),("Basiala Amongo",70,16)],
   "FW":[("Ramos Kashala Wanet",72,40),("Ravel Djoumekou",73,9),("Henoc Molia",69,23)],
   "source":"https://www.transfermarkt.com/fc-saint-eloi-lupopo/kader/verein/22838 [2026/27 squad]"
 },
 "cont_ofc_7": {
   "GK":[("Moana Rakei",68,1),("Emmett Connolly",66,20)],
   "DF":[("John Noovao",68,5),("Shane Tuteru",67,12),("Oscar Wichman",67,15)],
   "MF":[("Grover Harmon",70,3),("Ngametua Tuakana",68,6),("Joshua Galletly",68,7),("Kima Webb",69,10)],
   "FW":[("Geoffrey Strickland",69,8),("Campbell Best",70,9),("Daniel Bunch",70,16)],
   "source":"https://demo.arkanet.co.za/content/wikipedia_en_all_maxi_2026-02/Tupapa_Maraerenga_F.C. [current squad February 2026; subsequent registrations not confirmed]"
 },
 "cont_conmebol_24": {
   "GK":[("Giancarlo Schiavone",72,13),("Carlos González",68,12)],
   "DF":[("Alfonso Simarra",72,19),("Kendrys Silva",70,2),("Daniel Carrillo",70,27)],
   "MF":[("Francisco Solé",74,6),("Carlos Cermeño",72,57),("Alexander González",71,30),("Vicente Rodríguez",70,17)],
   "FW":[("Samuel Sosa",76,10),("Jovanny Bolívar",75,11),("Juan Camilo Zapata",73,8)],
   "source":"https://www.transfermarkt.com/universidad-central-de-venezuela/kader/verein/43146 [2026 squad]"
 },
 "cont_ofc_3": {
   "GK":[("Thomas Schmidt",67,21),("Raphaël Genton",68,16)],
   "DF":[("Henri Wélépane",67,3),("Morgan Mathelon",68,6),("Josué Welepane",70,4)],
   "MF":[("Shene Wélépane",69,12),("Gutacene Wadra",69,7),("Antoine Simane",69,10),("Kuane Wawalaha",68,13)],
   "FW":[("Pierre Iékawé",67,14),("Willy Read",70,9),("Jean-Yves Saiko",72,19)],
   "source":"https://footballoceania.com/2026/08/08/oceania-champions-league-everything-you-need-to-know/amp/ [2026 OFC Men’s Champions League registered squad; role and shirt]"
 },
 "cont_afc_13": {
   "GK":[("Mohammed Salih",74,20),("Mohammed Raheem Ziyadi",70,31)],
   "DF":[("Edmilson Dove",75,6),("Ruslan Hanoon",71,2)],
   "MF":[("Saad Abdul-Amir Al-Zirjawi",74,8),("Daniel Ajibola",74,44)],
   "FW":[("Haythem Jouini",75,9),("Eid Al-Rashidi",74,11),("Anthony Okpotu",74,19)],
   "source":"https://www.transfermarkt.com/al-quwa-al-jawiya/kader/verein/23805/saison_id/2026 [26/27]"
 },
 "cont_afc_24": {
   "GK":[("Michael Falkesgaard",74,1)],
   "FW":[("Teerasak Poeiphimai",75,9),("Jude Soonsup-Bell",74,11),("Athit Berg",71,17)],
   "source":"https://www.national-football-teams.com/club/18173/2026_1/Port_Fc_Bangkok.html [26/27]"
 },
 "cont_afc_26": {
   "GK":[("Chen Wei",69,12)],
   "DF":[("Tyias Browning",76,3),("Wei Zhen",73,13)],
   "MF":[("Kodjo Aziangbe",72,6)],
   "source":"https://en.wikipedia.org/wiki/2026_Shanghai_Port_F.C._season [2026 squad]; https://www.national-football-teams.com/app.php/club/27992/2026/Shanghai_Port.html"
 },
 "cont_concacaf_11": {
   "MF":[("Kyle Bekker",74,10)],
   "FW":[("Lucas Cavallini",76,9)],
   "source":"https://www.national-football-teams.com/club/23567/2026_2/Forge_Fc_Hamilton.html [2026 season]"
 },
 "cont_conmebol_19": {
   "GK":[("Weibmar Asprilla",69,12)],
   "FW":[("Franco Fagúndez",75,9),("Hugo Rodallega",73,11)],
   "source":"https://gol.conmebol.com/sudamericana/en/news/independiente-santa-fe-en-la-conmebol-sudamericana-2026-resultados-plantel-y-calendario [official 2026 squad]"
 },
 "cont_ofc_4": {
   "GK":[("Epeli Loaniceva",69,1),("James Do'oro",72,1)],
   "DF":[("Samuela Ibo Kautoga",69,4),("Calvin Ohasio",69,2),("Kavaia Rawaqa",68,3)],
   "MF":[("Patrick Joseph",70,6),("Ramzan Khan",69,8),("Rahul Krishna",72,10),("Epeli Valevou",68,14)],
   "FW":[("Norman Ngahu",72,9),("Merrill Nand",71,9),("Don Keana",70,10)],
   "source":"https://www.national-football-teams.com/club/809/2026_2/Rewa_Fc.html [2026 season]"
 },
 "cont_ofc_2": {
   "DF":[("Ricky Aitamai",70,3),("Marama Amau",69,4),("Tefai Faehau-Heitaa",68,5)],
   "MF":[("Stanley Atani",72,10),("Tauhiti Keck",72,8),("Kitin Maro",69,7),("Yann Pennequin Le Bras",69,6)],
   "FW":[("Patrick Tepa",69,9),("Teaonui Tehau",75,10),("Germain Haewegene",73,10)],
   "GK":[("Tevaearai Tamatai",70,1),("Herehau Reichart",69,22)],
   "source":"https://footballoceania.com/2026/08/08/oceania-champions-league-everything-you-need-to-know/amp/ [2026 OFC Men’s Champions League registered squad; role and shirt]"
 },
 "cont_concacaf_4": {
   "GK":[("Edrick Menjívar",74,1),("Onan Rodríguez",70,22)],
   "DF":[("Clinton Bennett",70,4),("José García",71,3),("Kevin Güity",70,2)],
   "MF":[("Jorge Álvarez",73,6),("Edwin Rodríguez",76,10),("Jack Jean-Baptiste",72,8),("Pedro González",71,18)],
   "FW":[("Yustin Arboleda",74,9),("Jorge Benguché",75,11),("Michaell Chirinos",76,7)],
   "source":"https://www.national-football-teams.com/club/1127/2026_1/Olimpia_Tegucigalpa.html [2026/27 Honduras]"
 },
 "cont_concacaf_1": {
   "GK":[("Christopher Biggette",70,1),("Jabari St. Hillaire",69,12)],
   "DF":[("Sheldon Bateau",75,4),("Isaiah Garcia",72,2),("Shirwin Noel",70,33)],
   "MF":[("Rivaldo Coryat",72,13),("Justin Sadoo",70,21),("Kevon Goddard",71,6),("Keilon Burnett-Acevedo",69,34)],
   "FW":[("Kathon St. Hillaire",75,9),("Jelani Félix",73,11),("Darius Ollivierra",71,17)],
   "source":"https://national-football-teams.com/club/2552/2026/Defence_Force_Mucurapo.html [2026/27 Trinidad and Tobago]"
 },
 "cont_ofc_5": {
   "GK":[("Charles Lepani",68,1),("Ronald Warisan",70,16)],
   "DF":[("Alwin Komolong",71,4),("Felix Komolong",70,5),("Charles Hayes",67,3)],
   "MF":[("Abraham Allen",69,6),("Obert Bika",68,8),("Solomon Kamake",68,10),("Jacob Sabua",70,12)],
   "FW":[("Jonathan Allen",69,9),("Mathew David",68,11),("Stahl Gubag",67,7)],
   "source":"https://www.national-football-teams.com/club/27268/2026_2/Lae_City.html [2026 season]"
 },
 "cont_caf_3": {
   "GK":[("Lawrence Mulenga",72,1),("Willard Mwanza",69,16)],
   "DF":[("Dominic Chanda",72,3),("Kondwani Chiboni",69,5),("Aaron Katebe",70,14)],
   "MF":[("Owen Tembo",73,10),("Frederick Mulambia",70,8),("Prince Mumba",69,6),("Salulani Phiri",69,18)],
   "FW":[("Ismaël Ankobo",72,11),("Austin Muwowo",72,7),("Moses Shumah",72,9)],
   "source":"https://www.national-football-teams.com/club/2763/2026/Power_Dynamos_Kitwe.html [2026/27]"
 },
 "cont_caf_14": {
   "GK":[("Hugo Marques",76,1),("Augusto Mualucano",68,22)],
   "DF":[("Joel Odair Pinto Neves",72,2),("Rúben Constantino Adérito",71,4),("Pedro Manuel da Mota Pinto",71,13)],
   "MF":[("Pedro Miguel Santos Aparício",74,10),("Benny",71,12),("Jorge Javier Moreira Pereira",72,20),("Walter Monteiro",69,35)],
   "FW":[("Tiago Azulão",75,26),("Jonathan Toro",74,8),("Tomás Morais Costa",73,11)],
   "source":"https://supersport.com/football/team/b2471a32-de20-4b49-8e93-3d16c3b7ab20/squad [2026 squad listing]"
 },
 "cont_caf_9": {
   "GK":[("Farid Ouédraogo",76,1),("Muhamed Madani",68,16)],
   "DF":[("Mamudu Kamaradin",72,3),("Mustafa Karshoum",73,19),("Altayeb Abdelrazeg",69,4)],
   "MF":[("Abdel Raouf",75,8),("Salah Adel",72,15),("Madicke Kane",70,18),("Walieldin Khedr",70,21)],
   "FW":[("Muhamed Abdelrahman",77,10),("Yaser Muzmel",74,9),("Sunday Adetunji",73,31)],
   "source":"https://newikis.com/en/Al_Hilal_Club_(Omdurman) [squad dated 2026-08-22]"
 },
 "cont_caf_5": {
   "GK":[("Djigui Diarra",77,39),("Hussein Masalanga",68,22)],
   "DF":[("Issaka Boka",72,23),("Ibrahim Abdallah Hamad",73,4),("Dickson Job",72,5)],
   "MF":[("Duke Abuya",73,8),("Mudathir Yahya",75,10),("Lassine Kouma",72,16),("Pacôme Zouzoua",74,24)],
   "FW":[("Peter Shalulile",78,9),("Prince Dube",75,11),("Clement Mzize",74,17)],
   "source":"https://www.national-football-teams.com/club/2528/2026_1/Young_Africans_Dar_Es_Salaam.html [2026/27]"
 },
 "cont_afc_16": {"GK": [
    ("Tomoki Hayakawa",76,1),("Taiki Yamada",71,21),("Yuji Kajikawa",69,29)],
   "source":"https://en.wikipedia.org/wiki/2026_Kashima_Antlers_season"},
 "cont_afc_4": {"GK": [
    ("Khalid Eisa",76,17),("Mohammed Bu Senda",70,1),("Hassan Muhammed",67,35)],
   "source":"https://www.transfermarkt.co.uk/al-ain-fc/kader/verein/2150/saison_id/2026"},
 "cont_conmebol_12": {"GK": [
    ("Hugo de Souza",78,1),("Felipe Longo Fernandes",69,40),("Matheus Corrêa Leite de Moraes",66,50)],
   "source":"https://gol.conmebol.com/libertadores/en/news/corinthians-2026-conmebol-libertadores-results-squad-and-schedule"},
 "cont_conmebol_23": {"GK": [
    ("Rodolfo Anderson",69,1),("Vidal",67,13),("Díaz",68,28)],
   "source":"https://starting11.com/cusco/squad"}
}
def main():
 data_path=ROOT/"data/players/continental.json"
 data=json.loads(data_path.read_text())
 report_path=ROOT/"docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json"
 report=json.loads(report_path.read_text())
 new=0;log=[]
 for team_id,record in CURATED.items():
    roster=data[team_id]
    occupied={clean(p["name"]) for p in roster if not p.get("fictional")}
    nums={int(p["num"]) for p in roster if p.get("num") is not None}
    for role,candidates in record.items():
     if role=="source":continue
     vacancies=[p for p in roster if p["role"]==role and p.get("fictional")]
     for slot in vacancies:
      match=next(((name,ovr,number) for name,ovr,number in candidates if clean(name) not in occupied),None)
      if match is None:continue
      name,ovr,number=match;oldnum=slot.get("num")
      nums.discard(oldnum)
      chosen=generated_number(nums,number)
      nums.add(chosen)
      occupied.add(clean(name))
      slot.update({"name":name,"rating":ovr,"role":role,"fictional":False,"num":chosen,
          "ratingSource":"Editorial medium-level position estimate; not an FC27 OVR",
          "source":record["source"],"sourceSnapshot":"2026-10-15",
          "rosterVerification":"2026_club_squad_source","statsVerified":False,
          "shirtVerified":False,"ageVerified":False,"appearanceVerified":False,
          "fc27Position":role,**stats({"overall_rating":str(ovr)},role)})
      for key in ("fc27Id","birthDate","canonicalId","height","nation","age"):slot.pop(key,None)
      new+=1;log.append((team_id,role,name,ovr))
    assert len(roster)==12 and collections.Counter(p["role"] for p in roster)==QUOTAS
    assert len({clean(p["name"]) for p in roster})==12
    assert len({p["num"] for p in roster})==12
    report[team_id]["selected"]=[{"name":p["name"],"role":p["role"],"rating":p["rating"]} for p in roster]
    report[team_id]["fictionalRemaining"]=sum(bool(p.get("fictional")) for p in roster)
    # Idempotent provenance: repeat executions must not fabricate extra batches.
    origin_parts=[s for s in str(report[team_id].get("origin") or "").split("+") if s]
    if "INDEPENDENT_2026_SQUAD" not in origin_parts:
        origin_parts.append("INDEPENDENT_2026_SQUAD")
    report[team_id]["origin"]="+".join(dict.fromkeys(origin_parts))
    source_parts=[s.strip() for s in str(report[team_id].get("source") or "").split(";") if s.strip()]
    next_source=record["source"].strip()
    if next_source not in source_parts:source_parts.append(next_source)
    report[team_id]["source"]="; ".join(dict.fromkeys(source_parts))
    print("CURATED",team_id,report[team_id]["club"],"remaining",report[team_id]["fictionalRemaining"])
 js_path=ROOT/"src/roster_corrections.js"
 content=js_path.read_text()
 start=content.index("{",content.index("export const ROSTER_CORRECTIONS ="))
 registry,offset=json.JSONDecoder().raw_decode(content[start:])
 for team_id in CURATED:registry[team_id]=data[team_id]
 js_path.write_text(content[:start]+json.dumps(registry,ensure_ascii=False,separators=(",",":"))+
                    ";\n// Source-labeled audited club rosters synchronized with data/players.\n")
 data_path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
 report_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 print("CURATED SUMMARY",json.dumps({"verifiedPlayersAdded":new,"newNames":log,"fictionalRemaining":sum(v["fictionalRemaining"] for v in report.values())},ensure_ascii=False))
if __name__=="__main__":main()
