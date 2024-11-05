'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Smartphone, CreditCard, Phone } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'


// Type for vote counts
type VoteCount = {
  id: string
  likes: number
}

export default function VotePage() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedNominee, setSelectedNominee] = useState('')
  const [voteCounts, setVoteCounts] = useState<{ [key: string]: number }>({})
  const firstNomineesSectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Function to fetch votes
  const fetchVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id, likes')

      if (error) {
        console.error('Error fetching votes:', error)
        return
      }

      // Convert array to object for easier access
      const counts = (data as VoteCount[]).reduce((acc, curr) => {
        acc[curr.id] = curr.likes
        return acc
      }, {} as { [key: string]: number })

      setVoteCounts(counts)
    } catch (error) {
      console.error('Error in fetchVotes:', error)
    }
  }

  // Load votes on component mount and set up real-time subscription
  useEffect(() => {
    fetchVotes()

    // Set up real-time subscription
    const subscription = supabase
      .channel('votes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        (payload) => {
          console.log('Change received!', payload)
          fetchVotes()
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleVote = (operator: string) => {
    setLoading(true)
    router.push(`/pages/payement?operator=${operator}&nominee=${selectedNominee}`)
  }

  const scrollToFirstNominees = () => {
    firstNomineesSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const nominees = [
    [
      { id: '1', name: 'BAOL Paul', logo: '/image1.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '2', name: 'MBADJOUN Y. Guérin', logo: '/image2.jpg', company: 'AGRI-NICO' },
      { id: '3', name: 'NAHBILA Rosine', logo: '/image3.jpg', company: 'SGPC' },
      { id: '4', name: 'NDOM NDOM Wilfried', logo: '/image4.jpg', company: 'WILSON AIROUMA' },
      { id: '5', name: 'NYEMB Franck Eric', logo: '/image5.jpg', company: 'JAS' },
    ],
    [
      { id: '6', name: 'DIEUGANG PYGOL (Zarock New)', logo: '/image6.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '7', name: 'NLEND Thomas (Docteur du mbolé)', logo: '/image7.jpg', company: 'AGRI-NICO' },
      { id: '8', name: 'Ebili M. Arthur (Ema Love)', logo: '/image8.jpg', company: 'SGPC' },
      { id: '9', name: 'BISSASSA (Grosso)', logo: '/image9.jpg', company: 'WILSON AIROUMA' },
      { id: '10', name: 'LOBÈ', logo: '/image10.jpg', company: 'JAS' },
    ],
    [
      { id: '11', name: 'AUDREY NGUENDJE', logo: '/image11.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '12', name: 'AURORE NKOL', logo: '/image12.jpg', company: 'AGRI-NICO' },
      { id: '13', name: 'POKE MADJAÏL', logo: '/image13.jpg', company: 'SGPC' },
      { id: '14', name: 'REINE LELE', logo: '/image14.jpg', company: 'WILSON AIROUMA' },
    ],
    [
      { id: '15', name: 'KINE CHRISTELLE', logo: '/a1.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '16', name: 'NDE MBIME SANDRINE', logo: '/a2.jpg', company: 'AGRI-NICO' },
      { id: '17', name: 'ELIMBI FRANÇOIS', logo: '/a3.jpg', company: 'SGPC' },
      { id: '18', name: 'HAMAN YOUGOUDA', logo: '/a4.jpg', company: 'WILSON AIROUMA' },
      { id: '19', name: 'DR. NLOGA GUY', logo: '/a5.jpg', company: 'JAS' },
    ],
    [
      { id: '20', name: 'BIONYE BAYA (AS Lamantin de DIZ)', logo: '/S1.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '21', name: 'AMBATINDE BELINGA (AS Ivof de DIZ)', logo: '/S2.jpg', company: 'AGRI-NICO' },
      { id: '22', name: 'TOME LELE Reine (Lionne indomptable du criket)', logo: '/S3.jpg', company: 'SGPC' },
      { id: '23', name: 'BEKOE Richard (Espace foot Horizon)', logo: '/S4.jpg', company: 'WILSON AIROUMA' },
    ],
    [
      { id: '24', name: 'AS LAMANTIN DE DIZANGUE', logo: '/E1.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '25', name: 'AS IVOF DE DIZANGUE', logo: '/E2.jpg', company: 'AGRI-NICO' },
    ],
    [
      { id: '26', name: 'AMIN FOMEMBIN Clovis', logo: '/S5.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '27', name: 'BAONGA Antoine Alain', logo: '/S6.jpg', company: 'AGRI-NICO' },
      { id: '28', name: 'TONYE NDJOOH', logo: '/S7.jpg', company: 'SGPC' },
    ],
    [
      { id: '29', name: 'LYCÉE TECHNIQUE DE DIZANGUE', logo: '/ly.png', company: 'PAOLO CHAUSSURES' },
      { id: '30', name: 'LYCÉE BILINGUE DE MBAMBOU', logo: '/ly.png', company: 'AGRI-NICO' },
      { id: '31', name: 'LYCÉE BILINGUE DE DIZANGUE', logo: '/ly.png', company: 'SGPC' },
      { id: '32', name: 'COLLÈGE SAINT GÉRARD', logo: '/ly.png', company: 'WILSON AIROUMA' },
    ],
    [
      { id: '33', name: 'NKIBIKWE ÉLISABETH', logo: '/b1.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '34', name: 'MILONE BIBICHE', logo: '/b2.jpg', company: 'AGRI-NICO' },
      { id: '35', name: 'NAHBILA Rosine', logo: '/b3.jpg', company: 'SGPC' },
    ],
    [
      { id: '36', name: "Minka'a Mbende", logo: '/t1.jpg', company: 'PAOLO CHAUSSURES' },
      { id: '37', name: '⁠EDOUNG HEN Honoré', logo: '/t2.jpg', company: 'AGRI-NICO' },
      { id: '39', name: 'LOBGA Charmant', logo: '/t4.jpg', company: 'SGPC' },
      { id: '38', name: 'Capi NYOM', logo: '/t3.jpg', company: 'SGPC' },
    ],
  ]

  const categories = [
    "MEILLEURE ENTREPRISE JEUNE",
    "MEILLEUR ARTISTE MUSICIEN JEUNE",
    "MEILLEURE ARTISTE (Acteur, Comédien)",
    "MEILLEUR AGENT DE SANTÉ JEUNE",
    "MEILLEUR SPORTIF JEUNE",
    "MEILLEUR CLUB SPORTIF JEUNE",
    "MEILLEUR AGENT DE SÉCURITÉ JEUNE",
    "ETABLISSEMENT SCOLAIRE LE PLUS PROPRE",
    "MEILLEUR JEUNE ENTREPRENEUR FÉMININ",
    "MEILLEUR JEUNE ENSEIGNANT"
  ]

  const sponsors = [
    { id: 1, name: 'Sponsor 1', logo: '/logo-s1.jpg' },
    { id: 2, name: 'Sponsor 2', logo: '/logo-s2.jpg' },
    { id: 3, name: 'Sponsor 3', logo: '/logo-s3.jpg' },
    { id: 4, name: 'Sponsor 4', logo: '/logo-s4.jpg' },
    { id: 5, name: 'Sponsor 5', logo: '/logo-s5.jpg' },
    { id: 6, name: 'Sponsor 6', logo: '/logo-s6.jpg' },
    { id: 7, name: 'Sponsor 7', logo: '/logo-s7.jpg' },
    { id: 8, name: 'Sponsor 8', logo: '/logo-s8.jpg' },
    { id: 9, name: 'Sponsor 9', logo: '/logo-s9.jpg' },
  ]

  return (
    <div className="bg-black">
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-black via-[#4a3f10] to-black flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl w-full"
        >
          <div className="mb-8">
            <Image
              src="/1.jpg"
              alt="Dizangue Youth Awards"
              width={400}
              height={200}
              className="mx-auto rounded-lg"            />
          </div>
          <h1 className="text-4xl font-bold text-[#FFD700] mb-6">Votez pour votre favori</h1>
          <p className="text-xl text-white mb-3">Votre voix compte. Participez au changement dès maintenant !</p>
          <div className="flex items-center justify-center space-x-1 mb-3">
  
  <p className="font-bold text-xl text-white">
  1 vote = 150 FCFA =  1
  </p>
  <Heart className="w-4 h-4 text-red-500 fill-current" />
</div>

          <Button
            onClick={scrollToFirstNominees}
            className="bg-[#FFD700] text-black hover:bg-[#FFC000] transition-all duration-300 text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl"
          >
            Voter maintenant
          </Button>
        </motion.div>
      </div>

      {/* Nominees Sections */}
      {nominees.map((nomineeGroup, index) => (
        <div 
          key={index}
          ref={index === 0 ? firstNomineesSectionRef : null}
          className="bg-gradient-to-br from-black via-[#4a3f10] to-black relative p-8"
        >
          <div className="relative z-10 max-w-6xl mx-auto text-white">
            <div className="text-center mb-3">
              <h2 className="text-3xl font-bold text-white mb-4">
                CATÉGORIE : <span className="text-[#FFD700]">{categories[index]}</span>
              </h2>
              <div className="inline-block bg-[#FFD700] text-black px-8 py-2 rounded-full text-xl font-semibold">
                Les nominés
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-3 justify-center">
              {nomineeGroup.map((nominee) => (
                <motion.div
                  key={nominee.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-lg p-4 cursor-pointer flex flex-col items-center"
                  onClick={() => {
                    setSelectedNominee(nominee.id)
                    setIsOpen(true)
                  }}
                >
                  <div className="w-full h-32 flex items-center justify-center mb-4">
                    <Image
                      src={nominee.logo}
                      alt={nominee.company}
                      width={100}
                      height={100}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="text-center font-bold text-sm text-black">{`${nominee.name}`}</p>
                  <div className="flex items-center justify-center space-x-1">
  <Heart className="w-4 h-4 text-red-500 fill-current" />
  <p className="font-bold text-sm text-black">
    Likes ({voteCounts[nominee.id] || 0})
  </p>
</div>
                </motion.div>
              ))}
            </div>

            {index === nominees.length - 1 && (
              <>
                <div className="text-center text-white mb-8">
                  <h3 className="flex items-center justify-center gap-2 text-lg mb-4">
                    <Phone className="h-5 w-5" />
                    Numéro utile : (+237) 686316707 / 680998097 / 653276382
                  </h3>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-9 gap-4 items-center">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="bg-white/10 p-2 rounded">
                      <Image
                        src={sponsor.logo}
                        alt={`Logo ${sponsor.name}`}
                        width={50}
                        height={50}
                        className="w-full h-auto object-contain"
                        priority={true}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {index < nominees.length - 1 && (
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FFD700] to-transparent my-2" />
          )}
        </div>
      ))}

      {/* Payment Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-black border border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="text-[#FFD700]">Choisissez votre moyen de paiement</DialogTitle>
            <DialogDescription className="text-white">
              Sélectionnez le service qui vous convient le mieux pour procéder au vote.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => handleVote('orange')} 
                disabled={loading} 
                className="w-full h-32 flex flex-col items-center justify-center space-y-2 border-[#FFD700] bg-black text-[#FFD700] hover:bg-[#FFD700] hover:text-black" 
                variant="outline"
              >
                <Smartphone className="h-8 w-8" />
                <span>Orange Money</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => handleVote('mtn')} 
                disabled={loading} 
                className="w-full h-32 flex flex-col items-center justify-center space-y-2 border-[#FFD700] bg-black text-[#FFD700] hover:bg-[#FFD700] hover:text-black" 
                variant="outline"
              >
                <CreditCard className="h-8 w-8" />
                <span>MTN Mobile Money</span>
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
