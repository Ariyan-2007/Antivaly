using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class DeliveryRepo: IRepository<Delivery, string>
    {
        AntivalyEntities db;

        public DeliveryRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(Delivery e)
        {
            this.db.Deliveries.Add(e);
            this.db.SaveChanges();
        }

        public void Delete(string id)
        {
            var delivery = db.Deliveries.FirstOrDefault(c => c.UID == id);
            db.Deliveries.Remove(delivery);
            db.SaveChanges();
        }

        public void Edit(Delivery e)
        {
            var d = db.Deliveries.FirstOrDefault(en => en.ID == e.ID);
            db.Entry(d).CurrentValues.SetValues(e);
            db.SaveChanges();
        }

        public List<Delivery> Get()
        {
            return db.Deliveries.ToList();
        }

        public Delivery Get(string id)
        {
            return db.Deliveries.FirstOrDefault(c => c.UID == id);
        }
    }
}
