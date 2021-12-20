const app = Vue.createApp({
    data() {
        return {
            congress_members: [],
            sorted_congress_members: [],
            filtred_states: [],
            partys: ["D", "R", "ID"],
            state: "",
            congress_statistics: {
                democrats: [],
                republicans: [],
                independents: [],
                democrats_average_votes_with_party: 0,
                republicans_average_votes_with_party: 0,
                independents_average_votes_with_party: 0,
                most_loyal: [],
                least_loyal: [],
                most_engaged: [],
                least_engaged: []
            }
        }
    },
    created() {
        let chamber = document.title.includes('Senate') ? 'senate' : 'house'

        let endpoint = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`

        let init = {
            headers: {
                'X-API-Key': 'Qr2oILJT6EfwErsBoeppxpORW0tUl238x02aAOa4'
            }
        }
        fetch(endpoint, init)
            .then(res => res.json())
            .then(json => {
                this.congress_members = json.results[0].members

                this.generateStateOptions()

                this.savePartyMembers('democrats', 'D')
                this.savePartyMembers('republicans', 'R')
                this.savePartyMembers('independents', 'ID')

                this.calculateAverageVotes('democrats', 'democrats_average_votes_with_party')
                this.calculateAverageVotes('republicans', 'republicans_average_votes_with_party')
                this.calculateAverageVotes('independents', 'independents_average_votes_with_party')

                this.takeMembers("missed_votes_pct", 'most_engaged', 'least_engaged')
                this.takeMembers("votes_against_party_pct", 'most_loyal', 'least_loyal')
            })

    },
    methods: {
        //FUNCIÓN PARA FILTRAR Y ORDENAR LOS ESTADOS DEL SELECT
        generateStateOptions() {
            this.congress_members.forEach(member => {
                if (!this.filtred_states.includes(member.state)) {
                    this.filtred_states.push(member.state)
                }
            })
            this.filtred_states.sort()
        },
        //------------------------------------------------------------

        //FUNCIÓN PARA FILTRAR MIEMBROS POR PARTIDO
        savePartyMembers(party, initial) {
            this.congress_statistics[party] = this.congress_members.filter(member => member.party === initial)
        },
        //------------------------------------------------------------------------------------------------------

        //FUNCIÓN PARA CALCULAR PORCENTAJE DE VOTOS POR PARTIDO
        calculateAverageVotes(party, membersVotes) {
            this.congress_statistics[party].forEach(member => {
                this.congress_statistics[membersVotes] = this.congress_statistics[membersVotes] +
                    member.votes_with_party_pct / this.congress_statistics[party].length
            })
        },
        //-----------------------------------------------------------------------------------------

        //FUNCIÓN PARA ORDENAR Y FILTAR INFORMACIÓN DE TABLAS
        takeMembers(votes, most, least) {

            let sorted_congress_members = [...this.congress_members].filter(member => member.total_votes > 0 && member.id != "E000172")

            sorted_congress_members.sort((member1, member2) => {
                if (member1[votes] > member2[votes]) {
                    return 1
                }
                if (member1[votes] < member2[votes]) {
                    return -1
                }
                return 0
            })

            for (let i = 0; i < (Math.round(this.congress_members.length * 0.1)); i++) {
                this.congress_statistics[most].push(sorted_congress_members[i])
            }
            for (let j = sorted_congress_members.length - 1; j > sorted_congress_members.length - 1 - (Math.round(this.congress_members.length * 0.1)); j--) {
                this.congress_statistics[least].push(sorted_congress_members[j])
            }
        }
    },
    computed: {
        //FUNCIÓN PARA FILTROS DE CHECKBOX Y SELECT
        filterMembers() {
            let filtredMembers = []
            filtredMembers = this.congress_members.filter(member => this.partys.includes(member.party) && (member.state === this.state || this.state === ""))
            return filtredMembers
        },
        //--------------------------------------------------------------------------------------------------------------------------------------------------------

        //FUNCIÓN PARA IMPRIMIR TABLA ÚNICA
        printPartysTable() {
            let partys_table = [
                {
                    party: 'Democrats',
                    num_reps: this.congress_statistics.democrats.length,
                    votes_whit_party: this.congress_statistics.democrats_average_votes_with_party.toFixed(2)
                },
                {
                    party: 'Republicans',
                    num_reps: this.congress_statistics.republicans.length,
                    votes_whit_party: this.congress_statistics.republicans_average_votes_with_party.toFixed(2)
                },
                {
                    party: 'Independents',
                    num_reps: this.congress_statistics.independents.length,
                    votes_whit_party: this.congress_statistics.independents_average_votes_with_party.toFixed(2)
                },
                {
                    party: 'Total',
                    num_reps: this.congress_members.length,
                    votes_whit_party: ((this.congress_statistics.independents_average_votes_with_party + this.congress_statistics.democrats_average_votes_with_party + this.congress_statistics.republicans_average_votes_with_party) / 3).toFixed(2)
                }
            ]
            return partys_table
        }
    }
})

app.mount("#app")