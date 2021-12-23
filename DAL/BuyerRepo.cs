using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class BuyerRepo : IRepository< Buyer, string>
    {
        AntivalyEntities db;

        public BuyerRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(Buyer e)
        {
            this.db.Buyers.Add(e);
            this.db.SaveChanges();
        }

        public void Delete(string id)
        {
            var buyer = db.Buyers.FirstOrDefault(c => c.BuyerId == id);
            db.Buyers.Remove(buyer);
            db.SaveChanges();
        }

        public void Edit(Buyer e)
        {
            var b = db.Buyers.FirstOrDefault(en => en.Id == e.Id);
            db.Entry(b).CurrentValues.SetValues(e);
            db.SaveChanges();
        }

        public List<Buyer> Get()
        {
            return db.Buyers.ToList();
        }

        public Buyer Get(string id)
        {
            return db.Buyers.FirstOrDefault(c => c.BuyerId == id);
        }
    }
}
